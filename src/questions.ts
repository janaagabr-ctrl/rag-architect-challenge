export type OptionKey = 'A' | 'B' | 'C' | 'D';

export interface QuizOption {
  key: OptionKey;
  text: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
  correctAnswer: OptionKey;
  points: number;
  explanation: string;
}

export const SCENARIO =
  'Your company is building an internal IT Support RAG Assistant. Employees use it to ask questions about VPN access, passwords, laptops, software, security procedures, and troubleshooting.';

export const questions: QuizQuestion[] = [
  {
    id: 1,
    points: 1,
    question:
      'Before employees can use the IT Support RAG Assistant, what should happen to the IT documents?',
    options: [
      { key: 'A', text: 'Send every document directly to the LLM for every question' },
      { key: 'B', text: 'Divide the documents into chunks, create embeddings, and store them in a searchable index' },
      { key: 'C', text: 'Train a completely new LLM from scratch' },
      { key: 'D', text: 'Convert every document into a list of passwords' },
    ],
    correctAnswer: 'B',
    explanation:
      'The indexing pipeline prepares the knowledge before users ask questions. Documents are processed into searchable chunks, converted into embeddings, and stored with useful metadata.',
  },
  {
    id: 2,
    points: 1,
    question:
      'An employee asks, “How do I reset my forgotten laptop password?” What should the RAG application do next?',
    options: [
      { key: 'A', text: 'Generate an answer immediately without searching' },
      { key: 'B', text: 'Embed the question and search the knowledge index for relevant guidance' },
      { key: 'C', text: 'Fine-tune the LLM using the employee’s question' },
      { key: 'D', text: 'Re-index every IT document before answering' },
    ],
    correctAnswer: 'B',
    explanation:
      'At query time, the system represents the question as an embedding and searches for relevant evidence. Re-indexing and fine-tuning are not required for every request.',
  },
  {
    id: 3,
    points: 1,
    question:
      'An employee searches for “I forgot my login credentials.” Which article should semantic search consider the most relevant?',
    options: [
      { key: 'A', text: 'Resetting a forgotten password' },
      { key: 'B', text: 'Requesting a replacement laptop' },
      { key: 'C', text: 'Connecting to office Wi-Fi' },
      { key: 'D', text: 'Booking a meeting room' },
    ],
    correctAnswer: 'A',
    explanation:
      'Embeddings can connect different wording with similar meaning. “Forgot my login credentials” and “resetting a forgotten password” express closely related intent.',
  },
  {
    id: 4,
    points: 1,
    question:
      'An employee asks, “How do I connect to the company VPN from home?” Which source should the system prioritize?',
    options: [
      { key: 'A', text: 'VPN Setup Guide 2023: Install LegacyVPN and connect using your employee ID' },
      { key: 'B', text: 'VPN Setup Guide 2026: Install SecureConnect and sign in using company SSO and MFA' },
      { key: 'C', text: 'Office Wi-Fi Guide 2026: Select the corporate wireless network when in the office' },
      { key: 'D', text: 'Laptop Ordering Guide 2026: Laptop requests require manager approval' },
    ],
    correctAnswer: 'B',
    explanation:
      'The 2026 VPN guide is both relevant and current. Semantic similarity alone is insufficient when an older document contains similar wording.',
  },
  {
    id: 5,
    points: 1,
    question:
      'The assistant tells an employee to install LegacyVPN. The current 2026 guide exists in the index, but the retriever selected the 2023 guide. The LLM correctly answered using that retrieved guide. Where did the primary failure occur?',
    options: [
      { key: 'A', text: 'Generation' },
      { key: 'B', text: 'Retrieval' },
      { key: 'C', text: 'Model size' },
      { key: 'D', text: 'User-interface design' },
    ],
    correctAnswer: 'B',
    explanation:
      'The model received outdated evidence and generated an answer from it. The main failure occurred during retrieval, not generation.',
  },
  {
    id: 6,
    points: 1,
    question:
      'What is the best way to reduce the chance of an outdated VPN guide being selected again?',
    options: [
      { key: 'A', text: 'Increase the LLM temperature' },
      { key: 'B', text: 'Store version, effective date, and document status as metadata and use them during retrieval' },
      { key: 'C', text: 'Make the prompt significantly longer' },
      { key: 'D', text: 'Store the entire IT handbook as one chunk' },
    ],
    correctAnswer: 'B',
    explanation:
      'Metadata allows the application to filter or rank by status, version, and effective date, helping it prioritize the current approved document.',
  },
  {
    id: 7,
    points: 1,
    question:
      'A VPN guide states: “Employees must sign in using company SSO. MFA verification is required before the VPN connection can be established.” Which chunking approach is best?',
    options: [
      { key: 'A', text: 'Keep both sentences together in one coherent chunk' },
      { key: 'B', text: 'Store the SSO sentence in one chunk and place the MFA requirement in an unrelated chunk' },
      { key: 'C', text: 'Store the entire 150-page IT handbook as one chunk' },
      { key: 'D', text: 'Remove the MFA sentence because it makes the chunk longer' },
    ],
    correctAnswer: 'A',
    explanation:
      'The instruction and its essential security requirement belong together. Separating them could cause the system to retrieve an incomplete procedure.',
  },
  {
    id: 8,
    points: 1,
    question:
      'The correct VPN troubleshooting article appears as search result number 6, but the application retrieves only the top 5 results. What could happen?',
    options: [
      { key: 'A', text: 'The article will automatically be sent to the LLM' },
      { key: 'B', text: 'The article may not reach the LLM at all' },
      { key: 'C', text: 'The LLM will automatically increase top-k' },
      { key: 'D', text: 'The embedding model will generate the answer directly' },
    ],
    correctAnswer: 'B',
    explanation:
      'With top-k set to 5, a result ranked sixth is excluded from the prompt unless retrieval, filtering, or reranking improves its position.',
  },
  {
    id: 9,
    points: 1,
    question:
      'The assistant retrieves this context:\n\n“VPN Troubleshooting Guide 2026: If the VPN connection fails, restart SecureConnect. If the problem continues, contact the IT Service Desk. Do not reinstall the application without IT approval.”\n\nWhich is the best grounded answer?',
    options: [
      { key: 'A', text: 'Reinstall SecureConnect and restart the laptop' },
      { key: 'B', text: 'Restart SecureConnect. If the issue continues, contact the IT Service Desk. Do not reinstall it without IT approval. Source: VPN Troubleshooting Guide 2026' },
      { key: 'C', text: 'Contact your manager and request a new laptop' },
      { key: 'D', text: 'Wait for 30 minutes because VPN issues normally resolve automatically' },
    ],
    correctAnswer: 'B',
    explanation:
      'The answer follows the retrieved evidence, preserves the warning about reinstalling, and identifies the source without inventing unsupported steps.',
  },
  {
    id: 10,
    points: 1,
    question:
      'The RAG system retrieved the correct 2026 troubleshooting guide and the correct chunk. The context says, “Do not reinstall the application without IT approval.” However, the LLM answers, “Uninstall the VPN application and install it again.” What should be investigated first?',
    options: [
      { key: 'A', text: 'Document ingestion' },
      { key: 'B', text: 'Chunking' },
      { key: 'C', text: 'Vector retrieval' },
      { key: 'D', text: 'Prompt and generation behaviour' },
    ],
    correctAnswer: 'D',
    explanation:
      'The correct evidence reached the model, but the generated answer contradicted it. The prompt instructions and generation behaviour should therefore be investigated first.',
  },
];
