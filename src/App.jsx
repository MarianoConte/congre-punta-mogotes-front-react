import React from 'react';
import {
  createBrowserRouter,
  Routes,
  Route,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom';
import Territorios from './components/Territorios';
import Edificios from './components/Edificios';
import MarcarEdificio from './components/MarcarEdificio';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/'>
      <Route path='/' element={<Territorios />} />
      <Route path='/territorio/:id' element={<Edificios />} />
      <Route path='/edificio/:id' element={<MarcarEdificio />} />
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
