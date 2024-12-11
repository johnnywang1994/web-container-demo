import { Suspense } from 'react'
import { useRoutes } from 'react-router-dom'
import routes from '~react-pages'
import Footer from '@/components/Footer';

function App() {
  const route = useRoutes(routes);
  return (
    <div className="flex flex-col h-dvh">
      <div className="flex-1 max-h-screen overflow-auto">
        <Suspense fallback={<p>Page Loading...</p>}>
          {route}
        </Suspense>
      </div>
      <Footer />
    </div>
  )
}

export default App
