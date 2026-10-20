import axios from 'axios';

const clienteAxios = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}`,
});

clienteAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Strapi corta cada pedido en 100 resultados (maxLimit en config/api.js del
// backend), aunque se pida más. Para listas que pueden superar ese número
// (departamentos de una torre, salidas acumuladas) hay que pedir página por
// página. Devuelve la misma forma que un GET normal: { data: [...] }.
const TAMANIO_PAGINA = 100;

export async function traerTodo(url) {
  const separador = url.includes('?') ? '&' : '?';
  const datos = [];
  let pagina = 1;
  let totalPaginas = 1;

  do {
    const { data } = await clienteAxios.get(
      `${url}${separador}pagination[page]=${pagina}&pagination[pageSize]=${TAMANIO_PAGINA}`
    );
    datos.push(...data.data);
    totalPaginas = data.meta?.pagination?.pageCount ?? 1;
    pagina++;
  } while (pagina <= totalPaginas);

  return { data: datos };
}

export default clienteAxios;
