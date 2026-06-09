export const metadata = {
  title: 'Everlong',
  description: 'Álbum de memórias do casal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
