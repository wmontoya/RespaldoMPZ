import { Page } from "components/General/Page";
import withAuthRedirect from "../hoc";
import { TimeList } from "components/Pages/tiempo/TimeList";

function TiempoPage() {
  
    return (
      <Page>
        <TimeList />
      </Page>
    );
}

export default withAuthRedirect(TiempoPage);