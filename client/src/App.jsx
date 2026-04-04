import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import Home from '@/pages/Home';
import Interpretar from '@/pages/Interpretar';
import Sonho from '@/pages/Sonho';
import Palpite from '@/pages/Palpite';
import Numerologia from '@/pages/Numerologia';
import TabelaAnimais from '@/pages/TabelaAnimais';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/interpretar" element={<Interpretar />} />
          <Route path="/sonho" element={<Sonho />} />
          <Route path="/palpite" element={<Palpite />} />
          <Route path="/numerologia" element={<Numerologia />} />
          <Route path="/tabela" element={<TabelaAnimais />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
