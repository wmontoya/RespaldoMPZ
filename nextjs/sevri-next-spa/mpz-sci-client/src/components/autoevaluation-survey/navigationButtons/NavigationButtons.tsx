import React from 'react'
import Button from '../../globals/button/Button'
import { BsCaretLeft, BsCaretRight } from 'react-icons/bs'


function NavigationButtons({ next, prev }: { next: () => void, prev: () => void }) {
    
  return (
    <div className='flex gap-4 justify-center mt-5 '>
      <Button onClick={prev} type='button' direction='left'>
        <BsCaretLeft size={20} /> Anterior
      </Button>
      <Button onClick={next} type='button' direction='right'>
        Siguiente <BsCaretRight size={20} />
      </Button>
    </div>
  )
}

export default NavigationButtons
