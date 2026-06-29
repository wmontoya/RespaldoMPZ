import { Page } from "components/General/Page";
import { PaymentForm } from "components/Pages/pagador/PaymentForm";
import withAuthRedirect from "../hoc";

function PagadorPage() {
  return (
    <Page>
      <PaymentForm />
    </Page>
  );
}

export default withAuthRedirect(PagadorPage);