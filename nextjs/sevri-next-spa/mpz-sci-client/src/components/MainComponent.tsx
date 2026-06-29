import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { SiMicrosoft } from "react-icons/si";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Loader from "./globals/loader/Loader";

function MainComponent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      setLoading(true);
      router.replace("/menu-Evaluations");
    }
  }, [router]);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signIn("azure-ad", { callbackUrl: "/api/v1/auth/exchange" });
    } catch (error) {
      setLoading(false);
      console.error("Sign in error:", error);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="from-dark_primary-500 to-dark_primary-600 bg-gradient-to-b min-h-screen place-content-center">
      <div className="flex place-content-center">
        <div className="bg-white h-96 p-8 rounded-lg shadow-lg text-center md:w-96 border-b-8 border-primary-800">
          <h2 className="text-2xl font-bold mb-6">
            Control de Riesgo - MPZ
          </h2>

          <button
            onClick={handleSignIn}
            className="w-full h-16 rounded-full bg-blue-600 text-white text-lg font-medium flex items-center justify-center gap-3 hover:bg-blue-700 transition"
          >
            <SiMicrosoft size={24} />
            Iniciar sesión con Microsoft
          </button>
        </div>
      </div>

      <footer className="text-white text-center mt-10">
        <Image
          className="mx-auto"
          src={"/mpz-logo.png"}
          alt=""
          width={200}
          height={200}
        />
        <h3>&copy; Municipalidad de Pérez Zeledón</h3>
      </footer>
    </div>
  );
}

export default MainComponent;


// import { useGlobalState } from '@/store/globalState';
// import { showInfoAlert } from '@/utils';
// import Image from 'next/image';
// import Link from 'next/link';
// import { useSearchParams } from 'next/navigation';
// import { useRouter } from 'next/navigation';
// import React, { useEffect } from 'react'
// import { SiOdoo } from 'react-icons/si';

// function MainComponent() {
//     const router = useRouter();
//     const searchParams = useSearchParams();
//     const token = searchParams.get("token");
//     const { verifyToken } = useGlobalState();
  
//     useEffect(() => {
//       if (token) {
//         verifyToken(token).then((res) => {
//           if (res === "success") {
//             document.cookie = `token=${token}; path=/; max-age=3600;`;
//             router.push("/menu-Evaluations");
//           }
//           if (res === "no department ") {
//             showInfoAlert("No se encontró el departamento","El departamento no existe o no ha sido asignado a este usuario, por favor contacte al administrador");
//           }
//           if (res === "error") {
//             showInfoAlert("Error","Ha ocurrido un error al verificar el usuario, por favor contacte al administrador");
//           }
//         });
//       }
//     }, [token]);
  
//     return (
//         <div className="from-dark_primary-500 to-dark_primary-600 bg-gradient-to-b min-h-screen place-content-center">
//           <div className="flex place-content-center">
//             <div className="bg-white h-96 p-8 rounded-lg shadow-lg text-center block place-content-center md:w-96  border-b-8 border-primary-800">
//               <h2 className="text-2xl font-bold mb-4">Control de Riesgo - MPZ</h2>
//               <Link href="/menu-Evaluations">
//                 <button
//                   className="bg-[linear-gradient(#e9e9e9,#e9e9e9_50%,#fff)] group w-50 h-16 inline-flex transition-all duration-300 overflow-visible p-1 rounded-full group"
//                 >
//                   <div
//                     className="w-full h-full bg-[linear-gradient(to_top,#ececec,#fff)] overflow-hidden shadow-[0_0_1px_rgba(0,0,0,0.07),0_0_1px_rgba(0,0,0,0.05),0_3px_3px_rgba(0,0,0,0.25),0_1px_3px_rgba(0,0,0,0.12)] p-1 rounded-full hover:shadow-none duration-300"
//                   >
//                     <div
//                       className="w-full h-full text-xl gap-x-0.5 gap-y-0.5 justify-center text-[#101010] bg-[linear-gradient(#f4f4f4,#fefefe)] group-hover:bg-[linear-gradient(#e2e2e2,#fefefe)] duration-200 items-center text-[18px] font-medium gap-4 inline-flex overflow-hidden px-4 py-2 rounded-full black group-hover:text-blue-600"
//                     >
//                       <SiOdoo size={30} className="text-center" />
//                       <span className="ml-2">Iniciar Sesión</span>
//                     </div>
//                   </div>
//                 </button>
//               </Link>
//             </div>
//           </div>
//           <footer className="text-white text-center">
//             <Image
//               className="mx-auto"
//               src={"/mpz-logo.png"}
//               alt={""}
//               width={250}
//               height={250}
//             />
//             <h3>&copy; Municipalidad de P&eacute;rez Zeled&oacute;n</h3>
//           </footer>
//         </div>
//     );
// }

// export default MainComponent