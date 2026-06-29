import Link from 'next/link'
import { useRouter } from 'next/router'
import Image from 'next/image'
import {
	FaClock,
	FaShoppingBag,
	FaMoneyBillAlt,
	FaCarSide,
} from 'react-icons/fa'
const links = [
	{ label: 'Comprar Tiempo', href: '/compras', icon: FaShoppingBag },
	{ label: 'Consulta de Tiempo', href: '/tiempo', icon: FaClock },
	{ label: 'Pago de Multas', href: '/pagos', icon: FaMoneyBillAlt },
	{ label: 'Garaje', href: '/garaje', icon: FaCarSide },
];
interface Props {
	haveBottoms?: boolean
}

const Navbar = ({ haveBottoms = true }: Props) => {
	const router = useRouter()
	const { basePath } = useRouter();
	return (
		<div className='fixed top-0 left-0 z-20 w-full pt-safe'>
			<header className='text-white bg-gradient-to-r from-blue-800 via-blue-900 to-blue-950 font-medium shadow-lg rounded-b-md text-sm text-center'>
				<div className='mx-auto flex h-20 max-w-screen items-center px-6'>
					<div className="flex items-center space-x-4">
						<div className="w-16 h-16  rounded-md flex items-center justify-center shadow-md">
							<Image
								src={`${basePath}/images/logo.png`}
								alt="Logo Municipalidad"
								width={55}
								height={55}
								className="object-contain"
							/>
						</div>
						<div className="text-white text-left">
							{/* Mostrar solo en lg y mayores */}
							<h1 className="text-lg font-bold leading-tight hidden lg:block">
								Municipalidad <span className="block">de Pérez Zeledón</span>
							</h1>
							{/* Mostrar solo en sm y md */}
							<h1 className="text-lg font-bold leading-tight block lg:hidden text-3xl font-bold tracking-wide">
								Municipalidad de Pérez Zeledón
							</h1>
						</div>

					</div>


					{haveBottoms && (
						<nav className='flex items-center flex-grow justify-end'>
							<div className='hidden sm:block'>
								<div className='flex items-center space-x-6'>
									{links.map(({ label, href, icon: Icon }) => (
										<Link
											key={label}
											href={href}
											className={`flex items-center gap-2 text-sm px-2 py-1 rounded-md transition ${router.pathname === href
												? 'text-white text-[16px] font-bold border-b-4 border-blue-500'
												: 'text-zinc-100 font-medium hover:text-white hover:border-b-4 hover:border-white'
												}`}
										>
											<Icon style={{ width: "25px" }} />
											{label}
										</Link>

									))}

								</div>
							</div>
						</nav>
					) }
				</div>
			</header>
		</div>
	)
}

export default Navbar