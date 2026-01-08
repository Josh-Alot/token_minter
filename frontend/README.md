# Token Minter Frontend

Interface web para fazer mint de tokens ERC-20 usando o contrato BurnoutToken.

## Funcionalidades

- ✅ Conexão com wallet (MetaMask, Injected, WalletConnect)
- ✅ Mint de tokens ERC-20 para qualquer endereço
- ✅ Auto-fill do endereço da wallet conectada
- ✅ Modal de confirmação após mint bem-sucedido
- ✅ Suporte para Sepolia testnet e Hardhat local

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto frontend:

```env
# Endereço do contrato BurnoutToken deployado
NEXT_PUBLIC_TOKEN_ADDRESS=0x...

# WalletConnect Project ID (opcional)
# Obtenha em: https://cloud.walletconnect.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...
```

### 3. Executar em desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## Como usar

1. **Conectar Wallet**: Clique no botão "Connect Wallet" no canto superior direito
2. **Trocar de Rede**: Se necessário, a aplicação pedirá para trocar para a rede Sepolia
3. **Preencher Formulário**:
   - Insira a quantidade de tokens a serem mintados
   - Insira o endereço do destinatário ou clique em "Use My Address" para auto-fill
4. **Mint**: Clique em "Mint Tokens" e confirme a transação na sua wallet
5. **Confirmação**: Após a confirmação, um modal será exibido com os detalhes do mint

## Tecnologias

- **Next.js 16**: Framework React
- **Wagmi v3**: Biblioteca para interação com Ethereum
- **Viem**: Biblioteca TypeScript para Ethereum
- **Tailwind CSS**: Estilização
- **TypeScript**: Tipagem estática

## Estrutura do Projeto

```
frontend/
├── app/
│   ├── layout.tsx          # Layout principal com providers
│   ├── page.tsx             # Página principal
│   └── globals.css          # Estilos globais
├── components/
│   ├── WalletConnect.tsx    # Componente de conexão de wallet
│   ├── MintERC20Form.tsx    # Formulário de mint
│   ├── MintSuccessModal.tsx # Modal de sucesso
│   └── Providers.tsx        # Providers do wagmi e react-query
├── lib/
│   ├── contracts.ts         # ABI e endereço do contrato
│   ├── wagmi-config.ts     # Configuração do wagmi
│   └── utils.ts             # Funções utilitárias
└── package.json
```

## Notas

- Certifique-se de que o contrato BurnoutToken está deployado antes de usar a aplicação
- Para desenvolvimento local, use o Hardhat network (chainId: 31337)
- Para produção/testnet, use Sepolia (chainId: 11155111)
