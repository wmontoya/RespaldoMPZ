import { BuyTime } from 'components/Pages/compras/BuyTime';
import { Page } from '../../../components/General/Page';
import withAuthRedirect from '../hoc';


const ComprasPage = () => {

	return (
		<Page>
			<BuyTime/>
		</Page>
	);
};

export default withAuthRedirect(ComprasPage);