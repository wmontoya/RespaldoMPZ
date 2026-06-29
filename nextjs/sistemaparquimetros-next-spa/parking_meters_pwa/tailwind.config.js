module.exports = {
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	darkMode: 'class',
	plugins: [require('tailwindcss-safe-area')],
}
