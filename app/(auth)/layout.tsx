import React from 'react'

function Layout({children}:{children:React.ReactNode}) {
  return (
    <div className='h-full flex items-center justify-center'>
      {children}
    </div>
  )
}

export default Layout
