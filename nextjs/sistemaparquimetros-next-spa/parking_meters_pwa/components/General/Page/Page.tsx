import BottomNavBar from "components/General/BottomNavBar/BottomNavBar"
import Navbar from "../Navbar/Navbar"

interface Props {
	title?: string
	children: React.ReactNode,
	haveBottoms?: boolean
}

export const Page = ({ children, haveBottoms= true }: Props) => (
	<>
		<Navbar haveBottoms={haveBottoms} />

		<main className='mt-24 pb-16 px-safe sm:pb-0' >
			<div className='ps-2 pe-2'>{children}</div>
		</main>
		{haveBottoms && <BottomNavBar />}
		
	</>
)


