import Link from 'next/link'
import { useRouter } from 'next/router'
import { FaRegClock, FaRegMoneyBillAlt, FaShoppingBag, FaWarehouse } from 'react-icons/fa'

const BottomNavBar = () => {
	const router = useRouter()

	return (
		<div className='sm:hidden'>
			<nav className='fixed bottom-0 w-full border-t bg-zinc-100 pb-safe dark:border-zinc-800 dark:bg-zinc-900 '>
				<div className='mx-auto flex h-16 max-w-md items-center justify-around px-6 '>
					{links.map(({ href, label, icon }) => (
						<Link
							key={label}
							href={href}
							className={`flex h-full w-full flex-col items-center justify-center space-y-1 rounded-lg ${
								router.pathname === href
									? 'text-indigo-500 dark:text-indigo-400'
									: 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
							}`}
						>
							{icon}
							<span className='text-xs text-zinc-600 dark:text-zinc-400'>
								{label}
							</span>
						</Link>
					))}
				</div>
			</nav>
		</div>
	)
}

export default BottomNavBar

const links = [
	{
		label: 'Comprar',
		href: '/compras',
		icon: (
			<FaShoppingBag className='w-18 h-18'/>
		),
	},
	{
		label: 'Tiempo',
		href: '/tiempo',
		icon: (
			<FaRegClock className='w-18 h-18'/>
		),
	},
	{
		label: 'Multas',
		href: '/pagos',
		icon: (
			<FaRegMoneyBillAlt className='w-18 h-18'/>
		),
	},
	{
		label: 'Garaje',
		href: '/garaje',
		icon: (
			<FaWarehouse className='w-18 h-18'/>
		),
	},
]
