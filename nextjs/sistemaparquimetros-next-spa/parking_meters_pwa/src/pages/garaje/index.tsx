import { Page } from "components/General/Page";
import { Garage } from "components/Pages/garaje/Garage";
import withAuthRedirect from "../hoc";

const GarajePage = () => {
  return (
    <>
      <Page>
        <Garage />
      </Page>
    </>
  );
};

export default withAuthRedirect(GarajePage);