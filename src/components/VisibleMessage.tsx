import React from 'react'

const VisibleMessage = () => {
  return (
<div className="h-full w-full flex items-center justify-center">
  <div className="bg-red-50 border border-red-300 text-red-700 px-6 py-4 rounded-xl shadow-sm text-lg font-semibold flex items-center space-x-2">
    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5.4 20h13.2c1.1 0 1.8-1.2 1.3-2.2L13.3 4.2c-.5-1-2-1-2.6 0L4.1 17.8c-.5 1 .2 2.2 1.3 2.2z" />
    </svg>
    <span>You are not eligible to see this</span>
  </div>
</div>

  )
}

export default VisibleMessage