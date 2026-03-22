import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route path="/" element={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-brand-500 mb-2">MotoLog</h1>
            <p className="text-gray-400">오토바이 차계부</p>
          </div>
        </div>
      } />
    </Routes>
  )
}

export default App
