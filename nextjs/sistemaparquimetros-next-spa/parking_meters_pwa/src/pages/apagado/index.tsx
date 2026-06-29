import Link from 'next/link';
import { Page } from '../../../components/General/Page';
import Image from 'next/image'
import { useRouter } from 'next/router';

const FueraDeLineaPage = () => {
    const { basePath } = useRouter();
    return (
        <Page haveBottoms={false}>
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="text-center">
                <div className="mb-6">
                <Image src={`${basePath}/images/escudo.png`} alt="Escudo" className="mx-auto" width={150} height={150} />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                    Servicio fuera de línea
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Actualmente estamos realizando mantenimiento en nuestro sistema.
                    <br /> Por favor, intente de nuevo más tarde. Agradecemos su comprensión.
                </p>
                <Link
                    href="/"
                    className="px-6 py-2 text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
                >
                    Volver a la página principal
                </Link>
            </div>
        </div>
        </Page>
    );
};

export default FueraDeLineaPage;