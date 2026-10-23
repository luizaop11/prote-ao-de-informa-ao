"use strict";

// ========================================
// NAVEGAÇÃO ENTRE OS MÓDULOS
// ========================================

const abas = document.querySelectorAll(".tab");
const paineis = document.querySelectorAll(".panel");

abas.forEach((aba) => {
    aba.addEventListener("click", () => {
        abas.forEach((item) => item.classList.remove("active"));
        paineis.forEach((painel) => painel.classList.remove("active"));

        aba.classList.add("active");
        document.getElementById(aba.dataset.target).classList.add("active");
    });
});

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

function mostrarMensagem(elemento, mensagem, tipo = "") {
    elemento.textContent = mensagem;
    elemento.className = "message";

    if (tipo) {
        elemento.classList.add(tipo);
    }
}

function copiarTexto(texto) {
    if (!texto || texto === "—") {
        return Promise.reject(new Error("Não há resultado para copiar."));
    }

    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(texto);
    }

    const campo = document.createElement("textarea");
    campo.value = texto;
    campo.style.position = "fixed";
    campo.style.opacity = "0";

    document.body.appendChild(campo);
    campo.select();

    const sucesso = document.execCommand("copy");
    campo.remove();

    return sucesso
        ? Promise.resolve()
        : Promise.reject(new Error("Não foi possível copiar."));
}

function configurarCopia(botaoId, resultadoId) {
    document.getElementById(botaoId).addEventListener("click", async () => {
        const texto = document.getElementById(resultadoId).textContent.trim();

        try {
            await copiarTexto(texto);
            alert("Resultado copiado!");
        } catch (erro) {
            alert(erro.message);
        }
    });
}

// ========================================
// 1. CIFRA DE SUBSTITUIÇÃO
// ========================================

const alfabeto = "abcdefghijklmnopqrstuvwxyz";
const dicionario = "qwertyuiopasdfghjklzxcvbnm";

const campoTextoCifra = document.getElementById("textoCifra");
const campoDeslocamento = document.getElementById("deslocamento");
const valorDeslocamento = document.getElementById("valorDeslocamento");
const resultadoCifra = document.getElementById("resultadoCifra");
const mensagemCifra = document.getElementById("mensagemCifra");

valorDeslocamento.textContent = campoDeslocamento.value;

campoDeslocamento.addEventListener("input", () => {
    valorDeslocamento.textContent = campoDeslocamento.value;
});

function codifica(senha, deslocamento = 1) {
    let resultado = "";

    for (const caractere of senha) {
        const minusculo = caractere.toLowerCase();
        const posicao = alfabeto.indexOf(minusculo);

        if (posicao !== -1) {
            let substituto = dicionario[posicao];

            if (caractere !== minusculo) {
                substituto = substituto.toUpperCase();
            }

            resultado += substituto;
        } else if (/^[0-9]$/.test(caractere)) {
            resultado += String((Number(caractere) + deslocamento) % 10);
        } else {
            resultado += caractere;
        }
    }

    return resultado;
}

function decodifica(texto, deslocamento = 1) {
    let resultado = "";

    for (const caractere of texto) {
        const minusculo = caractere.toLowerCase();
        const posicao = dicionario.indexOf(minusculo);

        if (posicao !== -1) {
            let original = alfabeto[posicao];

            if (caractere !== minusculo) {
                original = original.toUpperCase();
            }

            resultado += original;
        } else if (/^[0-9]$/.test(caractere)) {
            resultado += String((Number(caractere) - deslocamento + 10) % 10);
        } else {
            resultado += caractere;
        }
    }

    return resultado;
}

function executarCifra(modo) {
    const texto = campoTextoCifra.value;
    const deslocamento = Number(campoDeslocamento.value);

    if (!texto) {
        mostrarMensagem(mensagemCifra, "Digite um texto para continuar.", "error");
        return;
    }

    const resultado = modo === "codificar"
        ? codifica(texto, deslocamento)
        : decodifica(texto, deslocamento);

    resultadoCifra.textContent = resultado;

    mostrarMensagem(
        mensagemCifra,
        modo === "codificar"
            ? "Texto transformado com sucesso."
            : "Transformação inversa concluída.",
        "success"
    );
}

document.getElementById("btnCifrar").addEventListener("click", () => {
    executarCifra("codificar");
});

document.getElementById("btnDecifrar").addEventListener("click", () => {
    executarCifra("decodificar");
});

configurarCopia("copiarCifra", "resultadoCifra");

// ========================================
// 2. HASH DIDÁTICO DE 32 BITS
// ========================================

function calculaHash(senha, fator = 31) {
    let valor = 0;

    for (const letra of senha) {
        valor = (Math.imul(valor, fator) + letra.codePointAt(0)) >>> 0;
    }

    return valor.toString(16).padStart(8, "0");
}

document.getElementById("btnHash").addEventListener("click", () => {
    const senha = document.getElementById("textoHash").value;
    const fator = Number(document.getElementById("fatorHash").value);
    const resultado = document.getElementById("resultadoHash");
    const mensagem = document.getElementById("mensagemHash");

    if (!senha) {
        resultado.textContent = "—";
        mostrarMensagem(mensagem, "Digite um texto para calcular o hash.", "error");
        return;
    }

    resultado.textContent = "0x" + calculaHash(senha, fator);

    mostrarMensagem(
        mensagem,
        "Hash didático calculado. Isso não é um hash seguro para senhas.",
        "success"
    );
});

configurarCopia("copiarHash", "resultadoHash");

// ========================================
// 3. CADASTRO E LOGIN SIMULADOS
// ========================================

// Os dados existem somente na memória desta página.
// Não são enviados a um servidor nem salvos em um banco de dados.

let usuarioCadastrado = "";
let hashCadastrado = null;

document.getElementById("btnCadastro").addEventListener("click", () => {
    const usuario = document.getElementById("usuarioCadastro").value.trim();
    const senha = document.getElementById("senhaCadastro").value;
    const mensagem = document.getElementById("mensagemCadastro");

    if (!usuario || !senha) {
        mostrarMensagem(mensagem, "Preencha o usuário e a senha.", "error");
        return;
    }

    usuarioCadastrado = usuario;
    hashCadastrado = calculaHash(senha, 31);

    document.getElementById("usuarioLogin").value = usuario;
    document.getElementById("senhaLogin").value = "";

    mostrarMensagem(
        mensagem,
        "Cadastro demonstrativo concluído. O hash foi guardado na memória da página.",
        "success"
    );
});

document.getElementById("btnLogin").addEventListener("click", () => {
    const usuario = document.getElementById("usuarioLogin").value.trim();
    const senha = document.getElementById("senhaLogin").value;
    const mensagem = document.getElementById("mensagemLogin");

    if (hashCadastrado === null) {
        mostrarMensagem(mensagem, "Cadastre um usuário antes de fazer login.", "error");
        return;
    }

    if (!usuario || !senha) {
        mostrarMensagem(mensagem, "Preencha o usuário e a senha.", "error");
        return;
    }

    const hashDigitado = calculaHash(senha, 31);

    if (usuario === usuarioCadastrado && hashDigitado === hashCadastrado) {
        mostrarMensagem(mensagem, "Acesso liberado! Login demonstrativo realizado.", "success");
    } else {
        mostrarMensagem(mensagem, "Acesso negado. Verifique o usuário e a senha.", "error");
    }
});

// ========================================
// 4. VERIFICADOR DE SENHAS COMUNS
// ========================================

const senhasComuns = [
    "123456",
    "password",
    "123456789",
    "qwerty",
    "12345678",
    "111111",
    "12345",
    "columbia",
    "senha",
    "iloveyou",
    "admin",
    "abc123",
    "123123",
    "000000",
    "senha123"
];

const listaComuns = document.getElementById("listaComuns");

senhasComuns.forEach((senha) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = senha;
    listaComuns.appendChild(chip);
});

document.getElementById("btnVerificar").addEventListener("click", () => {
    const senha = document.getElementById("senhaVerificar").value;
    const resultado = document.getElementById("resultadoComuns");

    resultado.className = "result-box";

    if (!senha) {
        resultado.textContent = "Digite uma senha para verificar.";
        resultado.classList.add("error");
        return;
    }

    if (senhasComuns.includes(senha.toLowerCase())) {
        resultado.textContent =
            "⚠️ Atenção: esta senha está na lista de exemplos comuns. Escolha uma senha mais longa e exclusiva.";
        resultado.classList.add("error");
    } else {
        resultado.textContent =
            "Esta senha não está na lista didática. Isso não garante que ela seja forte ou que nunca tenha sido vazada.";
        resultado.classList.add("success");
    }
});

// ========================================
// 5. SIMULADOR EDUCATIVO DE FORÇA BRUTA
// ========================================

const campoTamanho = document.getElementById("tamanhoForca");
const campoAlfabeto = document.getElementById("alfabetoForca");
const valorTamanho = document.getElementById("valorTamanho");
const totalCombinacoes = document.getElementById("totalCombinacoes");
const tempoEstimado = document.getElementById("tempoEstimado");

function formatarNumero(numero) {
    return numero.toLocaleString("pt-BR");
}

function estimarTempo(segundos) {
    if (segundos < 1) {
        return "menos de 1 segundo";
    }

    if (segundos < 60) {
        return `${segundos.toFixed(2)} segundos`;
    }

    if (segundos < 3600) {
        return `${(segundos / 60).toFixed(1)} minutos`;
    }

    if (segundos < 86400) {
        return `${(segundos / 3600).toFixed(1)} horas`;
    }

    if (segundos < 31557600) {
        return `${(segundos / 86400).toFixed(1)} dias`;
    }

    const anos = segundos / 31557600;

    if (anos < 1e6) {
        return `${anos.toExponential(2)} anos`;
    }

    return `${anos.toExponential(2)} anos`;
}

function atualizarEstimativa() {
    const tamanho = Number(campoTamanho.value);
    const conjunto = Number(campoAlfabeto.value);
    const total = BigInt(conjunto) ** BigInt(tamanho);

    valorTamanho.textContent = String(tamanho);
    totalCombinacoes.textContent = formatarNumero(Number(total));

    const segundos = Number(total) / 1_000_000;
    tempoEstimado.textContent = estimarTempo(segundos);
}

campoTamanho.addEventListener("input", atualizarEstimativa);
campoAlfabeto.addEventListener("change", atualizarEstimativa);

atualizarEstimativa();

// Esta busca é propositalmente limitada a 256 tentativas.
// Não usa hashes nem tenta acessar contas ou serviços externos.

document.getElementById("btnForca").addEventListener("click", () => {
    const alvo = document.getElementById("senhaAlvo").value;
    const resultado = document.getElementById("resultadoForca");
    const caracteres = "01";
    const limiteTentativas = 256;

    resultado.className = "result-box";

    if (!/^[01]{1,8}$/.test(alvo)) {
        resultado.textContent =
            "Digite uma sequência de 1 a 8 caracteres, utilizando apenas 0 e 1.";
        resultado.classList.add("error");
        return;
    }

    if (alvo.length > 8) {
        resultado.textContent = "O limite desta demonstração é de 8 caracteres.";
        resultado.classList.add("error");
        return;
    }

    const total = 2 ** alvo.length;

    if (total > limiteTentativas) {
        resultado.textContent =
            "O exemplo ultrapassa o limite de tentativas permitido nesta demonstração.";
        resultado.classList.add("error");
        return;
    }

    let tentativas = 0;
    let encontrada = false;

    for (let numero = 0; numero < total; numero++) {
        const tentativa = numero.toString(2).padStart(alvo.length, "0");
        tentativas++;

        if (tentativa === alvo) {
            encontrada = true;
            break;
        }
    }

    if (encontrada) {
        resultado.textContent =
            `Demonstração concluída: combinação encontrada (${alvo}) após ${formatarNumero(tentativas)} tentativa(s), de um máximo de ${formatarNumero(total)} combinações.`;
        resultado.classList.add("success");
    } else {
        resultado.textContent = "A combinação não foi encontrada.";
        resultado.classList.add("error");
    }
});