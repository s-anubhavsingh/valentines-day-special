# 🚀 Setting Up Vercel Backend - Step by Step Guide

## What You Need
- ✅ GitHub account (you have this!)
- ✅ Vercel account connected to GitHub (you have this!)
- 🆕 Vercel KV Store (free, we'll set this up now)

---

## Step 1: Add New Files to GitHub

Upload these NEW files to your GitHub repository:
- `api/upload.js` → create a folder called `api`, put `upload.js` inside
- `vercel.json` → in the root folder
- `package.json` → in the root folder

Also replace these updated files:
- `index.html` (updated photo section)
- `home-styles.css` (new upload styles)
- `home-script.js` (new upload logic)

---

## Step 2: Set Up Vercel KV (Free Database)

This is where your photos get stored!

1. Go to **vercel.com** and log in
2. Click your project (your valentine website)
3. Click the **"Storage"** tab at the top
4. Click **"Create Database"**
5. Select **"KV"** (Key-Value store)
6. Name it: `valentine-photos` (or anything)
7. Select **"Free"** plan
8. Click **"Create"**

---

## Step 3: Connect KV to Your Project

1. After creating KV, you'll see a page with connection details
2. Click **"Connect to Project"**
3. Select your valentine website project
4. Click **"Connect"**

Vercel will automatically add the environment variables your backend needs! ✨

---

## Step 4: Redeploy

1. Go to your project on Vercel
2. Click **"Deployments"** tab
3. Click the three dots (**...**) next to your latest deployment
4. Click **"Redeploy"**
5. Wait about 1 minute for it to finish

---

## Step 5: Test It!

1. Visit your Vercel URL (e.g., `your-project.vercel.app`)
2. Fill in the customization form
3. Upload some photos from your device
4. Click **"Create & Get Shareable Link"**
5. You should see photos uploading, then get your link!
6. Open the link in a new tab to test it works ✅

---

## How It Works (Simple Explanation)

```
Your Device → Upload Photo → Vercel Backend → Save to KV Store
                                                      ↓
                                            Return Photo URL
                                                      ↓
                              URL gets encoded in your shareable link
                                                      ↓
Partner opens link → Vercel fetches photo → Shows in heart gallery
```

---

## ❓ Troubleshooting

**"Failed to upload image"**
- Check that you connected KV to your project (Step 3)
- Try redeploying (Step 4)

**Photos not showing for partner**
- Make sure you're testing on the Vercel URL (not locally!)
- Local testing won't work for the backend

**"KV" option not showing**
- You might need to verify your email on Vercel first
- Check that you're on the free Hobby plan or higher

---

## 📸 Photo Tips

- **Best size:** Under 5MB per photo
- **Best format:** JPG or PNG
- **Max photos:** 6 per customized page
- **Storage time:** Photos stay for 90 days

---

## 🔒 Privacy

- Photos are stored with a random unique ID
- Nobody can guess or find your photos without the link
- Only people with your special URL can see them
- Photos automatically delete after 90 days

---

## ✅ Final Checklist

- [ ] Uploaded `api/upload.js` to GitHub
- [ ] Uploaded `vercel.json` to GitHub  
- [ ] Uploaded `package.json` to GitHub
- [ ] Replaced `index.html`, `home-styles.css`, `home-script.js`
- [ ] Created KV database on Vercel
- [ ] Connected KV to your project
- [ ] Redeployed on Vercel
- [ ] Tested photo upload on live site

Once all boxes are checked, you're ready to share! 💕

---

Need help? Look for error messages in:
- Vercel Dashboard → your project → **"Logs"** tab
- Your browser → F12 → **"Console"** tab
