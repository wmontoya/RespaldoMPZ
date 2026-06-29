import type { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import Head from 'next/head';
import '../../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
	return (
		<>
			<Head>
				<meta
					name='viewport'
					content='width=device-width, initial-scale=1, user-scalable=0, viewport-fit=cover'
				/>
			</Head>
			<ThemeProvider
				attribute='class'
				defaultTheme='system'
				disableTransitionOnChange
			>
				<Component {...pageProps} />
			</ThemeProvider>
		</>
	);
}


// import type { AppProps } from 'next/app';
// import '../../styles/globals.css';

// import React, { useEffect, useRef } from 'react';
// import QRCode from 'qrcode';

// export default function App({ Component, pageProps }: AppProps) {
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   useEffect(() => {
//     const generateQRWithLogo = async () => {
//       const canvas = canvasRef.current;
//       if (!canvas) return;

//       const url = 'https://www.perezzeledon.go.cr/apps/parking';

//       await QRCode.toCanvas(canvas, url, {
//         width: 3000,
//         margin: 1,
//         errorCorrectionLevel: 'H', // 🛡 Alta tolerancia a errores
//         color: {
//           dark: '#000000',
//           light: '#ffffff',
//         },
//       });

//       const ctx = canvas.getContext('2d');
//       if (!ctx) return;

//       const logo = new Image();
//       logo.src = '/images/escudoqr.png'; // asegurate de que esté en /public/images/

//       logo.onload = () => {
//         const logoSize = 1000; // no más del 20% del QR
//         const x = (canvas.width - logoSize) / 2;
//         const y = (canvas.height - logoSize) / 2;
        
//         // Agregamos un fondo blanco circular debajo del logo (opcional)
//         ctx.save();
//         ctx.beginPath();
//         ctx.arc(canvas.width / 2, canvas.height / 2, logoSize / 2 + 4, 0, Math.PI * 2);
//         ctx.fillStyle = '#fff';
//         ctx.fill();
//         ctx.closePath();
//         ctx.restore();

//         ctx.drawImage(logo, x, y, logoSize, logoSize);
//       };
//     };

//     generateQRWithLogo();
//   }, []);

//   return (
//     <div className="p-4 text-center">
//       <h2 className="mb-4 font-semibold text-lg">Escaneá el código QR</h2>
//       <canvas ref={canvasRef} className="mx-auto shadow-md rounded-md" />
//     </div>
//   );
// }
