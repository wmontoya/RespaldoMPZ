import React from 'react'
import './loader.css'
function Loader() {
    return (
        <div className="fixed z-50 inset-0 overflow-y-auto" style={{ backgroundColor: '#061E48' }}>
            <div className='min-h-screen flex items-center justify-center'>
                <div className="flex flex-col items-center gap-8">
                    <div className="🤚">
                        <div className="👉"></div>
                        <div className="👉"></div>
                        <div className="👉"></div>
                        <div className="👉"></div>
                        <div className="🌴"></div>
                        <div className="👍"></div>
                    </div>
                    <span className="text-2xl font-bold text-white">Cargando...</span>
                </div>
            </div>
        </div>
    )
}

export default Loader