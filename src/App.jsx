import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [livros, setLivros] = useState([]);
  const [termo, setTermo] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const [querLer, setQuerLer] = useState(() => {
    const salvo = localStorage.getItem("querLer");
    return salvo ? JSON.parse(salvo) : [];
  });

  useEffect(() => {
    localStorage.setItem("querLer", JSON.stringify(querLer));
  }, [querLer]);

  async function buscar() {
    if (!termo.trim()) return;

    try {
      setCarregando(true);
      setErro("");
      const resposta = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(termo)}&limit=20`
      );
      if (!resposta.ok) throw new Error("Falha na busca");
      const dados = await resposta.json();
      setLivros(dados.docs);
    } catch (e) {
      setErro("Não foi possível buscar os livros.");
    } finally {
      setCarregando(false);
    }
  }

  function adicionar(livro) {
    if (querLer.some((l) => l.key === livro.key)) return;
    setQuerLer([...querLer, livro]);
  }

  function remover(key) {
    setQuerLer(querLer.filter((l) => l.key !== key));
  }

  function capaDe(livro) {
    return livro.cover_i
      ? `https://covers.openlibrary.org/b/id/${livro.cover_i}-M.jpg`
      : null;
  }

  return (
    <div className="app">
      <h1>📚 Buscador de Livros</h1>

      <div className="busca">
        <input
          type="text"
          placeholder="Digite um título ou autor"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && buscar()}
        />
        <button onClick={buscar}>Buscar</button>
      </div>

      {carregando && <p>Buscando livros...</p>}
      {erro && <p className="erro">{erro}</p>}

      <div className="grade">
        {livros.map((livro) => (
          <div className="card" key={livro.key}>
            {capaDe(livro) ? (
              <img src={capaDe(livro)} alt={`Capa de ${livro.title}`} />
            ) : (
              <div className="sem-capa">Sem capa</div>
            )}
            <h3>{livro.title}</h3>
            <p>{livro.author_name?.[0] ?? "Autor desconhecido"}</p>
            <button onClick={() => adicionar(livro)}>Quero ler</button>
          </div>
        ))}
      </div>

      <h2>⭐ Minha lista "Quero ler" ({querLer.length})</h2>
      {querLer.length === 0 && <p>Nenhum livro adicionado ainda.</p>}

      <div className="grade">
        {querLer.map((livro) => (
          <div className="card" key={livro.key}>
            {capaDe(livro) ? (
              <img src={capaDe(livro)} alt={`Capa de ${livro.title}`} />
            ) : (
              <div className="sem-capa">Sem capa</div>
            )}
            <h3>{livro.title}</h3>
            <p>{livro.author_name?.[0] ?? "Autor desconhecido"}</p>
            <button className="remover" onClick={() => remover(livro.key)}>
              Remover
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;