"use client"

import type React from "react"
import type { CSSProperties } from "react"
import { Modal as NextUIModal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/modal"
import { FaTimes } from "react-icons/fa"

interface ModalProps {
  id: string
  title?: string
  children: React.ReactNode
  width?: CSSProperties["width"]
  isOpen?: boolean
  isDismissable?: boolean
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "xs" | "3xl" | "4xl" | "5xl" | "full" | undefined
}

const Modal: React.FC<ModalProps & { onClose: () => void; onOpenChange?: () => void }> = ({
  size,
  title,
  children,
  onClose,
  isOpen,
  isDismissable = true,
}) => {
  return (
    <NextUIModal
      scrollBehavior="inside"
      size={size}
      isDismissable={isDismissable}
      isOpen={isOpen}
      onClose={onClose}
      hideCloseButton={true} // Ocultar el botón de cerrar predeterminado
    >
      <ModalContent>
        {() => (
          <>
            <div className="flex items-center justify-between px-4 py-2 relative">
              {/* <Link
                href="#"
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all duration-300 shadow-md"
              >
                <FaArrowLeft size={16} />
                <span>Volver</span>
              </Link> */}
              <ModalHeader className="flex-1 text-center">{title}</ModalHeader>

              <button
                onClick={onClose}
                className="absolute top-2 right-2 flex items-center justify-center w-10 h-10 rounded-full bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 transition-colors duration-200"
                aria-label="Cerrar"
              >
                <FaTimes size={16} />
              </button>
            </div>
            <ModalBody>{children}</ModalBody>
          </>
        )}
      </ModalContent>
    </NextUIModal>
  )
}

export default Modal

