// Welcome Email Template
exports.welcomeEmailTemplate = (name, verificationLink) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #d4a574, #8b6f4e); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 40px 30px; background: #f9f9f9; }
        .button { display: inline-block; padding: 15px 40px; background: #d4a574; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; padding: 30px; color: #666; font-size: 12px; background: #f0f0f0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎨 Welcome to Muse Cosmetics!</h1>
        </div>
        <div class="content">
            <p>Dear ${name},</p>
            <p>Thank you for creating an account with Muse Cosmetics. We're excited to have you on board!</p>
            <p>Please verify your email address by clicking the button below:</p>
            <p style="text-align: center;">
                <a href="${verificationLink}" class="button">Verify Email Address</a>
            </p>
            <p>If you didn't create this account, please ignore this email.</p>
            <p>Best regards,<br><strong>The Muse Cosmetics Team</strong></p>
        </div>
        <div class="footer">
            <p>Kiamunyi, Nakuru, Kenya | www.musecosmetics.co.ke</p>
            <p>© 2026 Muse Cosmetics. All rights reserved.</p>
        </div>
    </div>
</html>
`;

// Reset Password Template
exports.resetPasswordEmailTemplate = (name, resetLink) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #d4a574, #8b6f4e); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 40px 30px; background: #f9f9f9; }
        .button { display: inline-block; padding: 15px 40px; background: #d4a574; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; padding: 30px; color: #666; font-size: 12px; background: #f0f0f0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Password Reset Request</h1>
        </div>
        <div class="content">
            <p>Dear ${name},</p>
            <p>You requested to reset your password. Click the button below to proceed:</p>
            <p style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Password</a>
            </p>
            <div class="warning">
                <strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons.
            </div>
            <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
        </div>
        <div class="footer">
            <p>Muse Cosmetics | Kiamunyi, Nakuru, Kenya</p>
        </div>
    </div>
</html>
`;

// Order Confirmation Template
exports.orderConfirmationTemplate = (name, orderNumber, total) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 40px 30px; background: #f9f9f9; }
        .order-details { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .order-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .order-row:last-child { border-bottom: none; font-weight: bold; font-size: 18px; color: #d4a574; }
        .footer { text-align: center; padding: 30px; color: #666; font-size: 12px; background: #f0f0f0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Order Confirmed!</h1>
        </div>
        <div class="content">
            <p>Dear ${name},</p>
            <p>Thank you for your order! Your order has been received and is being processed.</p>
            <div class="order-details">
                <div class="order-row">
                    <span>Order Number:</span>
                    <strong>${orderNumber}</strong>
                </div>
                <div class="order-row">
                    <span>Total Amount:</span>
                    <strong>Ksh ${total}/=</strong>
                </div>
                <div class="order-row">
                    <span>Status:</span>
                    <span style="color: #ffc107;">⏳ Pending</span>
                </div>
            </div>
            <p>We'll send you another email when your order is shipped.</p>
            <p>Thank you for shopping with Muse Cosmetics!</p>
        </div>
        <div class="footer">
            <p>Kiamunyi, Nakuru, Kenya | www.musecosmetics.co.ke</p>
            <p>© 2026 Muse Cosmetics. All rights reserved.</p>
        </div>
    </div>
</html>
`;

// Order Status Update Template
exports.orderStatusUpdateTemplate = (name, orderNumber, status) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #0f8b8d, #2bbbad); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 40px 30px; background: #f9f9f9; }
        .status-box { background: white; padding: 24px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .footer { text-align: center; padding: 30px; color: #666; font-size: 12px; background: #f0f0f0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Update</h1>
        </div>
        <div class="content">
            <p>Dear ${name},</p>
            <p>Your order <strong>${orderNumber}</strong> has been updated.</p>
            <div class="status-box">
                <p style="margin: 0;">Current status:</p>
                <h2 style="margin: 8px 0 0; text-transform: capitalize; color: #d4a574;">${status}</h2>
            </div>
            <p>We will keep you posted as your order moves through the approval and delivery process.</p>
            <p>Thank you for shopping with Muse Cosmetics.</p>
        </div>
        <div class="footer">
            <p>Kiamunyi, Nakuru, Kenya | www.musecosmetics.co.ke</p>
            <p>© 2026 Muse Cosmetics. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;