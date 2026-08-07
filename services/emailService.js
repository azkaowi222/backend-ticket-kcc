import transporter from "../config/mailer.js";
import path from "path";

export const sendVerificationEmail = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Verifikasi Email",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
      </head>
      <body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
          <tr>
            <td align="center">

              <table width="600" cellpadding="0" cellspacing="0"
                style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,.08);">

                <!-- Header -->
                <tr>
                  <td align="center"
                    style="background:#2563eb;padding:30px;color:#ffffff;">

                    <img
                      src="cid:app-logo"
                      alt="Logo"
                      width="80"
                      height="80"
                      style="display:block;margin-bottom:15px;"
                    />

                    <h1 style="margin:0;font-size:24px;">
                      Verifikasi Email
                    </h1>

                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding:35px;color:#333333;">

                    <p style="font-size:16px;margin-top:0;">
                      Halo,
                    </p>

                    <p style="font-size:16px;line-height:1.6;">
                      Terima kasih telah mendaftar. Gunakan kode OTP berikut untuk
                      menyelesaikan proses verifikasi email Anda.
                    </p>

                    <div
                      style="
                        margin:30px auto;
                        width:220px;
                        text-align:center;
                        font-size:36px;
                        font-weight:bold;
                        letter-spacing:8px;
                        background:#f3f4f6;
                        padding:18px;
                        border-radius:10px;
                        color:#2563eb;
                      ">
                      ${otp}
                    </div>

                    <p style="font-size:15px;color:#666666;">
                      ⏰ Kode OTP ini hanya berlaku selama
                      <strong>5 menit</strong>.
                    </p>

                    <p style="font-size:15px;color:#666666;">
                      Demi keamanan akun, jangan membagikan kode ini kepada siapa pun.
                    </p>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td
                    align="center"
                    style="
                      background:#f8fafc;
                      padding:20px;
                      font-size:13px;
                      color:#888888;
                    ">

                    Email ini dikirim secara otomatis. Mohon jangan membalas email ini.

                    <br><br>

                    © ${new Date().getFullYear()} KCC TICKET. All rights reserved.

                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    attachments: [
      {
        filename: "image.png",
        path: path.join(process.cwd(), "image.png"),
        cid: "app-logo",
      },
    ],
  });
};
