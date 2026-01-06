import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-100 text-gray-900">
                <Routes>
                    {/* We will add our pages here later */}
                    <Route path="/" element={<h1 className="text-3xl font-bold text-center mt-10">Welcome to SkillSync</h1>} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;