# Mailchimp Integration Setup Guide

## Quick Setup Steps

### 1. Create a Mailchimp Account
- Go to [mailchimp.com](https://mailchimp.com) and sign up (free tier available)
- Verify your email address

### 2. Create an Audience (List)
- Go to **Audience** → **All contacts**
- Click **Create Audience** if you don't have one
- Name it "KICKOFFUSA Newsletter" or similar
- Complete the setup

### 3. Get Your Form Action URL
- Go to **Audience** → **Signup forms** → **Embedded forms**
- Select your audience/list
- Choose **Classic** form style
- Copy the **form action URL** (looks like: `https://yourdomain.us1.list-manage.com/subscribe/post?u=XXXXX&id=XXXXX`)

### 4. Update Your Code
- Open `index.html`
- Find the line: `const MAILCHIMP_FORM_ACTION = 'YOUR_MAILCHIMP_FORM_ACTION_URL_HERE';`
- Replace `YOUR_MAILCHIMP_FORM_ACTION_URL_HERE` with your actual Mailchimp form action URL
- Save and deploy

## Example

```javascript
const MAILCHIMP_FORM_ACTION = 'https://kickoffusa.us1.list-manage.com/subscribe/post?u=abc123&id=def456';
```

## Testing

1. Visit your website
2. Fill out the email signup form
3. Check your Mailchimp audience to see if the email was added
4. The subscriber should receive a welcome email (if configured in Mailchimp)

## Features

✅ Works with static sites (GitHub Pages)  
✅ No server required  
✅ Automatic email collection  
✅ Can send bulk emails for merch drops  
✅ Free tier: 500 contacts, 1,000 emails/month  

## Sending Merch Drop Notifications

Once subscribers are in your Mailchimp audience:

1. Go to **Campaigns** → **Create Campaign**
2. Choose **Email**
3. Select your audience
4. Design your email (use templates or custom)
5. Schedule or send immediately
6. Track opens and clicks

## Need Help?

- Mailchimp Support: https://mailchimp.com/help/
- Mailchimp API Docs: https://mailchimp.com/developer/

