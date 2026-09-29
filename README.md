# Backend with Phone Image Upload

## Local setup
1. Install Node.js 18+.
2. Run `npm install`
3. Copy `.env.example` to `.env`
4. Set a private `ADMIN_KEY`.
5. Run `npm start`
6. Open the frontend and tap 👤 -> ADMIN PANEL.
7. Enter the same admin key.
8. Choose an image from your phone gallery/storage and upload it.

## Important
This version stores uploaded images in the backend `uploads/` folder. On hosting platforms with ephemeral storage, uploaded files can disappear after a redeploy/restart. For a real production store, move image storage to Supabase Storage, Cloudinary, S3, etc., and use a persistent database.
