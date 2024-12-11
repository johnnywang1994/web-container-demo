function Home() {
  return (
    <div className="container flex flex-col items-center mx-auto px-6 py-4">
      <h1 className="text-xl">JSDC 2024 - Web Container Demo</h1>
      <ul className="mt-6">
        {Array(3).fill(0).map((_, i) => (
          <a key={i} href={`/demo${i + 1}`}>
            <li className="text-white bg-sky-500 hover:bg-sky-600 transition text-center w-[180px] px-4 py-2 mb-1 rounded-lg">
              Demo{i + 1}
            </li>
          </a>
        ))}
      </ul>
    </div>
  );
}

export default Home;
