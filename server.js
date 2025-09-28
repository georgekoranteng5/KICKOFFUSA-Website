const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_secret_key_here');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// PostgreSQL connection
const config = require('./config.js');
const pool = new Pool(config.database);

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

// Create tables if they don't exist
const createTablesQuery = `
  CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    team_name VARCHAR(255) NOT NULL,
    captain_name VARCHAR(255) NOT NULL,
    captain_email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    skill_level VARCHAR(50) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_intent_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tournaments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES tournaments(id),
    group_name VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS group_teams (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES groups(id),
    team_id INTEGER REFERENCES teams(id),
    points INTEGER DEFAULT 0,
    goals_for INTEGER DEFAULT 0,
    goals_against INTEGER DEFAULT 0,
    matches_played INTEGER DEFAULT 0,
    UNIQUE(group_id, team_id)
  );

  CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES tournaments(id),
    group_id INTEGER REFERENCES groups(id),
    team1_id INTEGER REFERENCES teams(id),
    team2_id INTEGER REFERENCES teams(id),
    team1_score INTEGER DEFAULT NULL,
    team2_score INTEGER DEFAULT NULL,
    match_time TIMESTAMP,
    field VARCHAR(50),
    status VARCHAR(50) DEFAULT 'scheduled',
    stage VARCHAR(50) DEFAULT 'group',
    round_number INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

pool.query(createTablesQuery, (err) => {
  if (err) {
    console.error('Error creating tables:', err);
  } else {
    console.log('Database tables ready');
  }
});

// API Routes

// Get all teams
app.get('/api/teams', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM teams ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching teams:', err);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Create a new team
app.post('/api/teams', async (req, res) => {
  try {
    const { teamName, captainName, captainEmail, phoneNumber, skillLevel, tournamentId } = req.body;
    
    const result = await pool.query(
      'INSERT INTO teams (team_name, captain_name, captain_email, phone_number, skill_level) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [teamName, captainName, captainEmail, phoneNumber, skillLevel]
    );
    
    // Send confirmation email
    try {
      const mailOptions = {
        from: 'kickoffusakickoffusa@gmail.com',
        to: captainEmail,
        subject: 'Team Registration Confirmation - KickoffUSA',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #111827; margin: 0;">KickoffUSA</h1>
              <p style="color: #6b7280; margin: 5px 0 0;">Soccer Initiative</p>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #111827; margin: 0 0 15px;">Team Registration Confirmed!</h2>
              <p style="color: #374151; margin: 0 0 10px;">Hello ${captainName},</p>
              <p style="color: #374151; margin: 0 0 15px;">Your team "<strong>${teamName}</strong>" has been successfully registered with KickoffUSA!</p>
            </div>
            
            <div style="background: #fff; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #111827; margin: 0 0 15px;">Team Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Team Name:</td>
                  <td style="padding: 8px 0; color: #111827;">${teamName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Captain:</td>
                  <td style="padding: 8px 0; color: #111827;">${captainName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Email:</td>
                  <td style="padding: 8px 0; color: #111827;">${captainEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Phone:</td>
                  <td style="padding: 8px 0; color: #111827;">${phoneNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Skill Level:</td>
                  <td style="padding: 8px 0; color: #111827;">${skillLevel}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h4 style="color: #92400e; margin: 0 0 10px;">What's Next?</h4>
              <ul style="color: #92400e; margin: 0; padding-left: 20px;">
                <li>We'll notify you when a tournament is created</li>
                <li>Your team will be assigned to a group</li>
                <li>You'll receive the match schedule and updates</li>
                <li>Check our website for live scores and standings</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">Thank you for joining KickoffUSA!</p>
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0;">Visit our website for updates and tournament information.</p>
            </div>
          </div>
        `,
        text: `
          Team Registration Confirmation - KickoffUSA
          
          Hello ${captainName},
          
          Your team "${teamName}" has been successfully registered with KickoffUSA!
          
          Team Details:
          - Team Name: ${teamName}
          - Captain: ${captainName}
          - Email: ${captainEmail}
          - Phone: ${phoneNumber}
          - Skill Level: ${skillLevel}
          
          What's Next?
          - We'll notify you when a tournament is created
          - Your team will be assigned to a group
          - You'll receive the match schedule and updates
          - Check our website for live scores and standings
          
          Thank you for joining KickoffUSA!
        `
      };
      
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Don't fail the registration if email fails
    }
    
    res.status(201).json({
      success: true,
      message: 'Team registered successfully',
      team: result.rows[0]
    });
  } catch (err) {
    console.error('Error creating team:', err);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// Get team by ID
app.get('/api/teams/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM teams WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching team:', err);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// Tournament Management Routes

// Get all tournaments
app.get('/api/tournaments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tournaments ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching tournaments:', err);
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

// Create a new tournament
app.post('/api/tournaments', async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query(
      'INSERT INTO tournaments (name, status) VALUES ($1, $2) RETURNING *',
      [name, 'upcoming']
    );
    
    res.status(201).json({
      success: true,
      tournament: result.rows[0]
    });
  } catch (err) {
    console.error('Error creating tournament:', err);
    res.status(500).json({ error: 'Failed to create tournament' });
  }
});

// Update tournament status
app.put('/api/tournaments/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const result = await pool.query(
      'UPDATE tournaments SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    
    res.json({ success: true, tournament: result.rows[0] });
  } catch (err) {
    console.error('Error updating tournament status:', err);
    res.status(500).json({ error: 'Failed to update tournament status' });
  }
});

// Generate tournament groups and fixtures
app.post('/api/tournaments/:id/generate', async (req, res) => {
  try {
    const { id } = req.params;
    const { groupSize = 4 } = req.body;
    
    // Clear existing groups and matches for this tournament
    await pool.query('DELETE FROM matches WHERE tournament_id = $1', [id]);
    await pool.query('DELETE FROM group_teams WHERE group_id IN (SELECT id FROM groups WHERE tournament_id = $1)', [id]);
    await pool.query('DELETE FROM groups WHERE tournament_id = $1', [id]);
    
    // Get all teams
    const teamsResult = await pool.query('SELECT * FROM teams ORDER BY RANDOM()');
    const teams = teamsResult.rows;
    
    if (teams.length < 2) {
      return res.status(400).json({ error: 'Need at least 2 teams to create a tournament' });
    }
    
    // Determine number of groups based on team count
    let numGroups;
    if (teams.length <= 4) {
      // For 4 or fewer teams, use single group
      numGroups = 1;
    } else {
      // For more than 4 teams, use multiple groups
      numGroups = Math.ceil(teams.length / groupSize);
    }
    
    // Create groups
    const groups = [];
    const groupNames = ['A', 'B', 'C', 'D', 'E', 'F'];
    
    for (let i = 0; i < numGroups; i++) {
      const groupResult = await pool.query(
        'INSERT INTO groups (tournament_id, group_name) VALUES ($1, $2) RETURNING *',
        [id, groupNames[i]]
      );
      groups.push(groupResult.rows[0]);
    }
    
    // Assign teams to groups
    for (let i = 0; i < teams.length; i++) {
      let groupIndex;
      if (numGroups === 1) {
        // Single group - all teams go to group A
        groupIndex = 0;
      } else {
        // Multiple groups - distribute teams evenly
        groupIndex = Math.floor(i / groupSize);
      }
      await pool.query(
        'INSERT INTO group_teams (group_id, team_id) VALUES ($1, $2)',
        [groups[groupIndex].id, teams[i].id]
      );
    }
    
    // Generate fixtures for each group
    const matches = [];
    for (const group of groups) {
      const groupTeamsResult = await pool.query(
        'SELECT t.* FROM teams t JOIN group_teams gt ON t.id = gt.team_id WHERE gt.group_id = $1',
        [group.id]
      );
      const groupTeams = groupTeamsResult.rows;
      
      // Round-robin fixtures
      for (let i = 0; i < groupTeams.length; i++) {
        for (let j = i + 1; j < groupTeams.length; j++) {
          const matchTime = new Date();
          matchTime.setHours(14 + matches.length, (matches.length * 30) % 60);
          
          const matchResult = await pool.query(
            'INSERT INTO matches (tournament_id, group_id, team1_id, team2_id, match_time, field) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [id, group.id, groupTeams[i].id, groupTeams[j].id, matchTime, `Field ${(matches.length % 2) + 1}`]
          );
          matches.push(matchResult.rows[0]);
        }
      }
    }
    
    res.json({
      success: true,
      message: 'Tournament generated successfully',
      groups: groups.length,
      matches: matches.length
    });
  } catch (err) {
    console.error('Error generating tournament:', err);
    res.status(500).json({ error: 'Failed to generate tournament' });
  }
});

// Get tournament groups and standings
app.get('/api/tournaments/:id/groups', async (req, res) => {
  try {
    const { id } = req.params;
    
    const groupsResult = await pool.query(`
      SELECT g.*, 
             array_agg(
               json_build_object(
                 'id', t.id,
                 'team_name', t.team_name,
                 'captain_name', t.captain_name,
                 'points', gt.points,
                 'goals_for', gt.goals_for,
                 'goals_against', gt.goals_against,
                 'matches_played', gt.matches_played
               ) ORDER BY gt.points DESC, (gt.goals_for - gt.goals_against) DESC
             ) as teams
      FROM groups g
      LEFT JOIN group_teams gt ON g.id = gt.group_id
      LEFT JOIN teams t ON gt.team_id = t.id
      WHERE g.tournament_id = $1
      GROUP BY g.id, g.group_name
      ORDER BY g.group_name
    `, [id]);
    
    res.json(groupsResult.rows);
  } catch (err) {
    console.error('Error fetching groups:', err);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Get tournament matches
app.get('/api/tournaments/:id/matches', async (req, res) => {
  try {
    const { id } = req.params;
    
    const matchesResult = await pool.query(`
      SELECT m.*, 
             t1.team_name as team1_name,
             t2.team_name as team2_name,
             g.group_name
      FROM matches m
      JOIN teams t1 ON m.team1_id = t1.id
      JOIN teams t2 ON m.team2_id = t2.id
      LEFT JOIN groups g ON m.group_id = g.id
      WHERE m.tournament_id = $1
      ORDER BY m.match_time
    `, [id]);
    
    res.json(matchesResult.rows);
  } catch (err) {
    console.error('Error fetching matches:', err);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// Generate knockout stages (semi-finals and finals)
app.post('/api/tournaments/:id/knockout', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Clear existing knockout matches for this tournament
    await pool.query('DELETE FROM matches WHERE tournament_id = $1 AND stage = $2', [id, 'knockout']);
    
    // Get top 2 teams from each group
    const groupsResult = await pool.query(`
      SELECT g.id as group_id, g.group_name,
             array_agg(
               json_build_object(
                 'id', t.id,
                 'team_name', t.team_name,
                 'points', gt.points,
                 'goals_for', gt.goals_for,
                 'goals_against', gt.goals_against
               ) ORDER BY gt.points DESC, (gt.goals_for - gt.goals_against) DESC
             ) as teams
      FROM groups g
      LEFT JOIN group_teams gt ON g.id = gt.group_id
      LEFT JOIN teams t ON gt.team_id = t.id
      WHERE g.tournament_id = $1
      GROUP BY g.id, g.group_name
      ORDER BY g.group_name
    `, [id]);
    
    const groups = groupsResult.rows;
    const knockoutTeams = [];
    
    // Get top 2 from each group
    groups.forEach(group => {
      const topTeams = group.teams.slice(0, 2);
      knockoutTeams.push(...topTeams);
    });
    
    if (knockoutTeams.length < 2) {
      return res.status(400).json({ error: 'Need at least 2 teams for knockout stage' });
    }
    
    // Determine tournament structure based on number of groups
    if (groups.length === 1) {
      // Single group: top 2 teams go straight to final
      const finalTime = new Date();
      finalTime.setHours(18, 0, 0, 0);
      
      const final = await pool.query(`
        INSERT INTO matches (tournament_id, team1_id, team2_id, match_time, field, stage, round_number, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
      `, [id, knockoutTeams[0].id, knockoutTeams[1].id, finalTime, 'Field 1', 'knockout', 1, 'scheduled']);
      
      res.json({
        success: true,
        message: 'Knockout stage generated successfully (Single Group - Direct Final)',
        semiFinals: 0,
        final: 1,
        teams: knockoutTeams.length
      });
    } else {
      // Multiple groups: top 2 from each group go to semi-finals
      if (knockoutTeams.length < 4) {
        return res.status(400).json({ error: 'Need at least 4 teams for semi-finals' });
      }
      
      // Create semi-finals
      const semi1Time = new Date();
      semi1Time.setHours(15, 0, 0, 0);
      
      const semi2Time = new Date();
      semi2Time.setHours(16, 30, 0, 0);
      
      // Semi-final 1: Group A winner vs Group B runner-up
      const semi1 = await pool.query(`
        INSERT INTO matches (tournament_id, team1_id, team2_id, match_time, field, stage, round_number, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
      `, [id, knockoutTeams[0].id, knockoutTeams[3].id, semi1Time, 'Field 1', 'knockout', 1, 'scheduled']);
      
      // Semi-final 2: Group B winner vs Group A runner-up
      const semi2 = await pool.query(`
        INSERT INTO matches (tournament_id, team1_id, team2_id, match_time, field, stage, round_number, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
      `, [id, knockoutTeams[1].id, knockoutTeams[2].id, semi2Time, 'Field 2', 'knockout', 1, 'scheduled']);
      
      // Create final (placeholder - will be updated when semi-finals are completed)
      const finalTime = new Date();
      finalTime.setHours(18, 0, 0, 0);
      
      const final = await pool.query(`
        INSERT INTO matches (tournament_id, team1_id, team2_id, match_time, field, stage, round_number, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
      `, [id, null, null, finalTime, 'Field 1', 'knockout', 2, 'pending']);
      
      res.json({
        success: true,
        message: 'Knockout stage generated successfully (Multiple Groups - Semi-finals)',
        semiFinals: 2,
        final: 1,
        teams: knockoutTeams.length
      });
    }
  } catch (err) {
    console.error('Error generating knockout stage:', err);
    res.status(500).json({ error: 'Failed to generate knockout stage' });
  }
});

// Payment Routes

// Create payment intent for tournament registration
app.post('/api/payments/create-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', tournamentId, teamId } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency,
      metadata: {
        tournamentId: tournamentId.toString(),
        teamId: teamId.toString()
      }
    });
    
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (err) {
    console.error('Error creating payment intent:', err);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Confirm payment and update team registration
app.post('/api/payments/confirm', async (req, res) => {
  try {
    const { paymentIntentId, teamId, tournamentId } = req.body;
    
    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      // Update team registration status
      await pool.query(
        'UPDATE teams SET payment_status = $1, payment_intent_id = $2 WHERE id = $3',
        ['paid', paymentIntentId, teamId]
      );
      
      res.json({
        success: true,
        message: 'Payment confirmed successfully'
      });
    } else {
      res.status(400).json({ error: 'Payment not completed' });
    }
  } catch (err) {
    console.error('Error confirming payment:', err);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Get a single match
app.get('/api/matches/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const matchResult = await pool.query(`
      SELECT m.*, 
             t1.team_name as team1_name,
             t2.team_name as team2_name,
             g.group_name
      FROM matches m
      LEFT JOIN teams t1 ON m.team1_id = t1.id
      LEFT JOIN teams t2 ON m.team2_id = t2.id
      LEFT JOIN groups g ON m.group_id = g.id
      WHERE m.id = $1
    `, [id]);
    
    if (matchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    res.json(matchResult.rows[0]);
  } catch (err) {
    console.error('Error fetching match:', err);
    res.status(500).json({ error: 'Failed to fetch match' });
  }
});

// Get knockout matches
app.get('/api/tournaments/:id/knockout', async (req, res) => {
  try {
    const { id } = req.params;
    
    const matchesResult = await pool.query(`
      SELECT m.*, 
             t1.team_name as team1_name,
             t2.team_name as team2_name,
             CASE 
               WHEN m.stage = 'knockout' AND m.round_number = 1 THEN 'Semi-Final'
               WHEN m.stage = 'knockout' AND m.round_number = 2 THEN 'Final'
               ELSE 'Group Stage'
             END as match_type
      FROM matches m
      LEFT JOIN teams t1 ON m.team1_id = t1.id
      LEFT JOIN teams t2 ON m.team2_id = t2.id
      WHERE m.tournament_id = $1 AND m.stage = 'knockout'
      ORDER BY m.round_number, m.match_time
    `, [id]);
    
    res.json(matchesResult.rows);
  } catch (err) {
    console.error('Error fetching knockout matches:', err);
    res.status(500).json({ error: 'Failed to fetch knockout matches' });
  }
});

// Update match result
app.put('/api/matches/:id/result', async (req, res) => {
  try {
    const { id } = req.params;
    const { team1_score, team2_score } = req.body;
    
    // Update match
    await pool.query(
      'UPDATE matches SET team1_score = $1, team2_score = $2, status = $3 WHERE id = $4',
      [team1_score, team2_score, 'completed', id]
    );
    
    // Get match details
    const matchResult = await pool.query(`
      SELECT m.*, g.id as group_id
      FROM matches m
      LEFT JOIN groups g ON m.group_id = g.id
      WHERE m.id = $1
    `, [id]);
    
    const match = matchResult.rows[0];
    
    if (match.group_id) {
      // Update group standings
      const points1 = team1_score > team2_score ? 3 : team1_score === team2_score ? 1 : 0;
      const points2 = team2_score > team1_score ? 3 : team2_score === team1_score ? 1 : 0;
      
      // Update team 1
      await pool.query(`
        UPDATE group_teams 
        SET points = points + $1, 
            goals_for = goals_for + $2, 
            goals_against = goals_against + $3,
            matches_played = matches_played + 1
        WHERE group_id = $4 AND team_id = $5
      `, [points1, team1_score, team2_score, match.group_id, match.team1_id]);
      
      // Update team 2
      await pool.query(`
        UPDATE group_teams 
        SET points = points + $1, 
            goals_for = goals_for + $2, 
            goals_against = goals_against + $3,
            matches_played = matches_played + 1
        WHERE group_id = $4 AND team_id = $5
      `, [points2, team2_score, team1_score, match.group_id, match.team2_id]);
    }
    
    // If it's a knockout match, check if we need to update the next round
    if (match.stage === 'knockout' && match.round_number === 1) {
      // This is a semi-final, update the final
      const winner = team1_score > team2_score ? match.team1_id : match.team2_id;
      
      // Find the final match and update it
      const finalResult = await pool.query(`
        SELECT id FROM matches 
        WHERE tournament_id = $1 AND stage = 'knockout' AND round_number = 2
        ORDER BY id LIMIT 1
      `, [match.tournament_id]);
      
      if (finalResult.rows.length > 0) {
        const finalId = finalResult.rows[0].id;
        
        // Check if this is the first semi-final to complete
        const completedSemis = await pool.query(`
          SELECT COUNT(*) as count FROM matches 
          WHERE tournament_id = $1 AND stage = 'knockout' AND round_number = 1 AND status = 'completed'
        `, [match.tournament_id]);
        
        if (completedSemis.rows[0].count == 1) {
          // First semi-final completed, set team1 in final
          await pool.query(`
            UPDATE matches SET team1_id = $1, status = 'scheduled' WHERE id = $2
          `, [winner, finalId]);
        } else {
          // Second semi-final completed, set team2 in final
          await pool.query(`
            UPDATE matches SET team2_id = $1, status = 'scheduled' WHERE id = $2
          `, [winner, finalId]);
        }
      }
    }
    
    res.json({ success: true, message: 'Match result updated' });
  } catch (err) {
    console.error('Error updating match result:', err);
    res.status(500).json({ error: 'Failed to update match result' });
  }
});

// Gallery Routes

// Get all gallery items by scanning assets/gallery folder
app.get('/api/gallery', async (req, res) => {
  try {
    const galleryPath = 'assets/gallery';
    const galleryItems = [];
    
    if (!fs.existsSync(galleryPath)) {
      return res.json([]);
    }
    
    // Recursively scan the gallery directory
    const scanDirectory = (dir, eventName = '') => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isFile()) {
          const ext = path.extname(item).toLowerCase();
          const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
          const isVideo = ['.mp4', '.mov', '.avi', '.webm'].includes(ext);
          
          if (isImage || isVideo) {
            // Use folder name as event name, or extract from filename if in root
            const finalEventName = eventName || extractEventName(item);
            const title = extractTitle(item);
            
            // Create relative path from assets/gallery
            const relativePath = path.relative('assets/gallery', itemPath).replace(/\\/g, '/');
            
            galleryItems.push({
              id: relativePath,
              title: title,
              event_name: finalEventName,
              description: '',
              file_path: `/assets/gallery/${relativePath}`,
              file_type: isImage ? 'image/' + ext.substring(1) : 'video/' + ext.substring(1),
              file_size: stat.size,
              original_name: item,
              created_at: stat.birthtime
            });
          }
        } else if (stat.isDirectory() && !item.startsWith('.')) {
          // Recursively scan subdirectories
          scanDirectory(itemPath, item);
        }
      }
    };
    
    scanDirectory(galleryPath);
    
    // Sort by creation time (newest first)
    galleryItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    res.json(galleryItems);
  } catch (err) {
    console.error('Error fetching gallery:', err);
    res.status(500).json({ error: 'Failed to fetch gallery items' });
  }
});

// Helper function to extract event name from filename
function extractEventName(filename) {
  // Remove file extension
  const nameWithoutExt = path.parse(filename).name;
  
  // Try to extract event name from common patterns
  // Pattern 1: event-name_photo1.jpg -> "Event Name"
  // Pattern 2: college-baller-2024-01.jpg -> "College Baller 2024"
  // Pattern 3: tournament_final.jpg -> "Tournament"
  
  let eventName = nameWithoutExt
    .replace(/[-_]/g, ' ')  // Replace dashes and underscores with spaces
    .replace(/\d+/g, '')    // Remove numbers
    .replace(/\s+/g, ' ')   // Replace multiple spaces with single space
    .trim();
  
  // Capitalize first letter of each word
  eventName = eventName.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  // If no meaningful name extracted, use a default
  if (!eventName || eventName.length < 3) {
    eventName = 'KickoffUSA Event';
  }
  
  return eventName;
}

// Helper function to extract title from filename
function extractTitle(filename) {
  const nameWithoutExt = path.parse(filename).name;
  
  // Convert filename to a readable title
  let title = nameWithoutExt
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Capitalize first letter of each word
  title = title.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  return title || 'Gallery Item';
}

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'kickoffusakickoffusa@gmail.com',
    pass: process.env.EMAIL_PASSWORD // Password added in .env file
  }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Email content
    const mailOptions = {
      from: 'kickoffusakickoffusa@gmail.com',
      to: 'kickoffusakickoffusa@gmail.com',
      subject: `New Contact Form Submission from ${firstName} ${lastName}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><em>This message was sent from the KickoffUSA website contact form.</em></p>
      `,
      text: `
        New Contact Form Submission
        
        Name: ${firstName} ${lastName}
        Email: ${email}
        Message: ${message}
        
        This message was sent from the KickoffUSA website contact form.
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    res.json({ 
      success: true, 
      message: 'Thank you for your message! We\'ll get back to you soon.' 
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message. Please try again later.' 
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Database: ${process.env.DB_NAME || 'kickoffusa'}`);
});
