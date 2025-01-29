/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html', // Inclui o arquivo HTML
    './src/**/*.{js,ts,jsx,tsx}', // Inclui todos os arquivos na pasta src
  ],
  theme: {
    extend: {
      colors:{
        azulFalcao:'#00C2FF',
        azulFalcaoSecundario:'#196E89',
        azulHeaderAdmin:'#00384A',
        azulBgAdmin:'#112F38',
        azulBgAluno: '#00C2FF',
        azulBotao: '#03A8DD',
      }
    }, // Personalizações opcionais
  },
  plugins: [],
};
