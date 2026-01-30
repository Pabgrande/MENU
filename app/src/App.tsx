import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Layout from './components/layout/Layout'
import LoadingScreen from './components/ui/LoadingScreen'

// Lazy loading de páginas para mejor rendimiento
const Today = lazy(() => import('./pages/Today'))
const Calendar = lazy(() => import('./pages/Calendar'))
const DayDetail = lazy(() => import('./pages/DayDetail'))
const Recipes = lazy(() => import('./pages/Recipes'))
const RecipeDetail = lazy(() => import('./pages/RecipeDetail'))
const ShoppingList = lazy(() => import('./pages/ShoppingList'))
const Settings = lazy(() => import('./pages/Settings'))
const ImportMenu = lazy(() => import('./pages/ImportMenu'))
const FamilyMembers = lazy(() => import('./pages/FamilyMembers'))

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/today" replace />} />
          <Route path="today" element={<Today />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="day/:date" element={<DayDetail />} />
          <Route path="recipes" element={<Recipes />} />
          <Route path="recipes/new" element={<RecipeDetail />} />
          <Route path="recipes/:id" element={<RecipeDetail />} />
          <Route path="shopping" element={<ShoppingList />} />
          <Route path="settings" element={<Settings />} />
          <Route path="settings/family" element={<FamilyMembers />} />
          <Route path="import-menu" element={<ImportMenu />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
