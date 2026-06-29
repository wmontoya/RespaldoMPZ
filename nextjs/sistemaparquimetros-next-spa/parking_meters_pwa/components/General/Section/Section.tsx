interface Props {
	children: React.ReactNode
}

export const Section = ({ children }: Props) => (
	<section className='mt-10'>{children}</section>
)
