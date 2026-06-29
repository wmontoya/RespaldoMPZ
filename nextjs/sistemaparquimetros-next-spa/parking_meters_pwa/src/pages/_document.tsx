import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
	return (
		<Html lang='en'>
			<Head>
				<meta charSet='utf-8' />
				<link rel='icon' type='image/png' href={process.env.NEXT_PUBLIC_ICON_ESCUDO} />
				<meta
					name='theme-color'
					content='#18181b'
					media='(prefers-color-scheme: dark)'
				/>
				<meta name='theme-color' content='#f4f4f5' />
				<link rel='apple-touch-icon' href='../images/icon-maskable-512.png' />
				<link rel='manifest' href={process.env.NEXT_PUBLIC_MANIFEST_PATH} />

				{/* <script src="https://unpkg.com/react-scan/dist/auto.global.js"></script> */}
			</Head>
			<body style={{ minWidth: "310px" }}>
				<Main />
				<NextScript />
			</body>
		</Html>
	)
}
