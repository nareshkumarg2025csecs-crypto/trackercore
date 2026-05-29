import React, { useState, useEffect, useRef } from "react";
import { Calculator as CalcIcon, X, Delete } from "lucide-react";

const Calculator = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("");
  const calcRef = useRef(null);

  // Toggle calculator
  const toggleOpen = () => setIsOpen(!isOpen);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && calcRef.current && !calcRef.current.contains(event.target) && !event.target.closest(".calc-trigger-btn")) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Handle calculator logic
  const handleInput = (val) => {
    // Prevent multiple consecutive operators
    const operators = ["+", "-", "*", "/", "%", "."];
    if (operators.includes(val)) {
      const lastChar = expression.slice(-1);
      if (operators.includes(lastChar)) {
        // Replace last operator
        setExpression((prev) => prev.slice(0, -1) + val);
        return;
      }
    }

    setExpression((prev) => prev + val);
  };

  const handleClear = () => {
    setExpression("");
    setResult("");
  };

  const handleBackspace = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  const handleCalculate = () => {
    if (!expression) return;
    try {
      // Evaluate expression safely using Function constructor
      // Sanitize input to only allow numbers and mathematical operators
      const sanitized = expression.replace(/[^0-9+\-*/%.]/g, "");
      
      // Perform evaluate
      const evalResult = new Function(`return ${sanitized}`)();
      
      if (evalResult === undefined || isNaN(evalResult)) {
        setResult("Error");
      } else {
        setResult(Number(evalResult.toFixed(4)).toString());
      }
    } catch (e) {
      setResult("Error");
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      // Ignore key events if user is typing in form inputs/textareas
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA" || activeElement.tagName === "SELECT")) {
        return;
      }

      const key = e.key;

      if (key >= "0" && key <= "9") {
        handleInput(key);
      } else if (["+", "-", "*", "/", "%", "."].includes(key)) {
        handleInput(key);
      } else if (key === "Enter" || key === "=") {
        e.preventDefault();
        handleCalculate();
      } else if (key === "Backspace") {
        handleBackspace();
      } else if (key === "Escape" || key.toLowerCase() === "c") {
        handleClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, expression]);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      
      {/* Floating Action Button */}
      <button
        onClick={toggleOpen}
        className="calc-trigger-btn flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-brand-card/85 border border-[rgba(255,255,255,0.08)] text-brand-text/60 hover:text-brand-accent hover:border-brand-accent/40 transition-all duration-300 shadow-lg cursor-pointer backdrop-blur-md"
        title="Toggle Financial Calculator"
      >
        {isOpen ? <X className="h-4.5 w-4.5 sm:h-5 sm:w-5" /> : <CalcIcon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />}
      </button>

      {/* Calculator Popup Panel */}
      {isOpen && (
        <div
          ref={calcRef}
          className="glass-panel w-[calc(100vw-48px)] sm:w-72 max-w-[320px] rounded-2xl p-4 mt-3 border border-brand-accent/25 shadow-2xl animate-fade-in sm:animate-slideup"
        >
          {/* Display */}
          <div className="bg-brand-bg/80 border border-brand-accent/10 rounded-xl p-3 mb-4 text-right overflow-hidden min-h-[70px] flex flex-col justify-between">
            <div className="text-[10px] sm:text-xs text-brand-text/40 font-mono break-all truncate">
              {expression || "0"}
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-brand-accent neon-text-glow truncate">
              {result || "= 0"}
            </div>
          </div>

          {/* Button Grid */}
          <div className="grid grid-cols-4 gap-2 font-mono">
            {/* Row 1 */}
            <button
              onClick={handleClear}
              className="py-3 rounded-xl text-xs font-bold bg-brand-danger/10 text-brand-danger border border-brand-danger/25 hover:bg-brand-danger hover:text-white transition duration-200 cursor-pointer"
            >
              C
            </button>
            <button
              onClick={() => handleInput("%")}
              className="py-3 rounded-xl text-xs font-bold bg-brand-card text-brand-text hover:bg-brand-accent/10 hover:text-brand-accent border border-brand-accent/5 transition duration-200 cursor-pointer"
            >
              %
            </button>
            <button
              onClick={handleBackspace}
              className="py-3 rounded-xl text-xs font-bold bg-brand-card text-brand-text hover:bg-brand-accent/10 hover:text-brand-accent border border-brand-accent/5 transition duration-200 flex items-center justify-center cursor-pointer"
            >
              <Delete className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleInput("/")}
              className="py-3 rounded-xl text-sm font-bold bg-brand-accent/10 text-brand-accent border border-brand-accent/20 hover:bg-brand-accent hover:text-brand-bg transition duration-200 cursor-pointer"
            >
              ÷
            </button>

            {/* Row 2 */}
            <button
              onClick={() => handleInput("7")}
              className="py-3 rounded-xl text-xs font-bold bg-brand-card text-brand-text hover:bg-brand-bg border border-[rgba(255,255,255,0.04)] transition duration-200 cursor-pointer"
            >
              7
            </button>
            <button
              onClick={() => handleInput("8")}
              className="py-3 rounded-xl text-xs font-bold bg-brand-card text-brand-text hover:bg-brand-bg border border-[rgba(255,255,255,0.04)] transition duration-200 cursor-pointer"
            >
              8
            </button>
            <button
              onClick={() => handleInput("9")}
              className="py-3 rounded-xl text-xs font-bold bg-brand-card text-brand-text hover:bg-brand-bg border border-[rgba(255,255,255,0.04)] transition duration-200 cursor-pointer"
            >
              9
            </button>
            <button
              onClick={() => handleInput("*")}
              className="py-3 rounded-xl text-sm font-bold bg-brand-accent/10 text-brand-accent border border-brand-accent/20 hover:bg-brand-accent hover:text-brand-bg transition duration-200 cursor-pointer"
            >
              ×
            </button>

            {/* Row 3 */}
            <button
              onClick={() => handleInput("4")}
              className="py-3 rounded-xl text-xs font-bold bg-brand-card text-brand-text hover:bg-brand-bg border border-[rgba(255,255,255,0.04)] transition duration-200 cursor-pointer"
            >
              4
            </button>
            <button
              onClick={() => handleInput("5")}
              className="py-3 rounded-xl text-xs font-bold bg-brand-card text-brand-text hover:bg-brand-bg border border-[rgba(255,255,255,0.04)] transition duration-200 cursor-pointer"
            >
              5
            </button>
            <button
              onClick={() => handleInput("6")}
              className="py-3 rounded-xl text-xs font-bold bg-brand-card text-brand-text hover:bg-brand-bg border border-[rgba(255,255,255,0.04)] transition duration-200 cursor-pointer"
            >
              6
            </button>
            <button
              onClick={() => handleInput("-")}
              className="py-3 rounded-xl text-sm font-bold bg-brand-accent/10 text-brand-accent border border-brand-accent/20 hover:bg-brand-accent hover:text-brand-bg transition duration-200 cursor-pointer"
            >
              -
            </button>

            {/* Row 4 */}
            <button
              onClick={() => handleInput("1")}
              className="py-3 rounded-xl text-xs font-bold bg-brand-card text-brand-text hover:bg-brand-bg border border-[rgba(255,255,255,0.04)] transition duration-200 cursor-pointer"
            >
              1
            </button>
            <button
              onClick={() => handleInput("2")}
              className="py-3 rounded-xl text-xs font-bold bg-brand-card text-brand-text hover:bg-brand-bg border border-[rgba(255,255,255,0.04)] transition duration-200 cursor-pointer"
            >
              2
            </button>
            <button
              onClick={() => handleInput("3")}
              className="py-3 rounded-xl text-xs font-bold bg-brand-card text-brand-text hover:bg-brand-bg border border-[rgba(255,255,255,0.04)] transition duration-200 cursor-pointer"
            >
              3
            </button>
            <button
              onClick={() => handleInput("+")}
              className="py-3 rounded-xl text-sm font-bold bg-brand-accent/10 text-brand-accent border border-brand-accent/20 hover:bg-brand-accent hover:text-brand-bg transition duration-200 cursor-pointer"
            >
              +
            </button>

            {/* Row 5 */}
            <button
              onClick={() => handleInput("0")}
              className="py-3 rounded-xl col-span-2 text-xs font-bold bg-brand-card text-brand-text hover:bg-brand-bg border border-[rgba(255,255,255,0.04)] transition duration-200 cursor-pointer"
            >
              0
            </button>
            <button
              onClick={() => handleInput(".")}
              className="py-3 rounded-xl text-xs font-bold bg-brand-card text-brand-text hover:bg-brand-bg border border-[rgba(255,255,255,0.04)] transition duration-200 cursor-pointer"
            >
              .
            </button>
            <button
              onClick={handleCalculate}
              className="py-3 rounded-xl text-xs font-bold bg-brand-accent text-brand-bg border border-brand-accent hover:bg-brand-accent/90 transition duration-200 cursor-pointer"
            >
              =
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calculator;
