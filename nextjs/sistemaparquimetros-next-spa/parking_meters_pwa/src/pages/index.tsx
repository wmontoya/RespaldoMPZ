import { Page } from '../../components/General/Page';
import { Section } from '../../components/General/Section';
import Head from 'next/head';
import withAuthRedirect from './hoc';

const Index = () => {

  return (
    <Page>
      <Section>
        <Head>
          <title>MPZ | Consulta de parquímetros</title>
          <meta name="description" content="Municipalidad de Pérez Zeledón" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <main className="dark:bg-gray-800">
          Redireccionando a consulta...
        </main>
      </Section>
    </Page>
  );
};

export default withAuthRedirect(Index);