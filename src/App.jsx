import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Territorios from './components/Territorios';
import Edificios from './components/Edificios';
import MarcarEdificio from './components/MarcarEdificio';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Territorios />} />
        <Route path='/territorio/:id' element={<Edificios />} />
        <Route path='/edificio/:id' element={<MarcarEdificio />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
