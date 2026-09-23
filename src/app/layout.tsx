import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PullUp Reminder",
  description: "Remember your reps. Keep going.",
};

/**
 * Applies the locally cached theme before first paint so returning
 * visitors never see a flash of the default theme. The server-saved
 * theme is applied by the app once it loads.
 */
const themeBootScript = `(function(){try{var t=window.localStorage.getItem("pullup-theme");if(t){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="volt" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className={`${inter.variable} ${grotesk.variable}`}>
        {children}
      </body>
    </html>
  );
}
