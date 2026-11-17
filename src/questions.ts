export type OptionKey = 'A' | 'B' | 'C' | 'D';

export interface QuizOption {
  key: OptionKey;
  text: string;
}

/** A piece of the question's setup, shown above the question itself. */
export type ContextBlock =
  | { type: 'text'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'list'; items: string[] };

export interface QuizQuestion {
  id: number;
  /** Short topic label, e.g. "Why RAG?" */
  topic: string;
  context: ContextBlock[];
  question: string;
  options: QuizOption[];
  correctAnswer: OptionKey;
  points: number;
  /** Text inside `backticks` renders as code. */
  explanation: string;
}

export const SCENARIO =
  'Your company is building an internal IT Support RAG Assistant. Employees use it to ask questions about VPN access, passwords, laptops, software, security procedures, and troubleshooting.';

const opts = (a: string, b: string, c: string, d: string): QuizOption[] => [
  { key: 'A', text: a },
  { key: 'B', text: b },
  { key: 'C', text: c },
  { key: 'D', text: d },
];

export const questions: QuizQuestion[] = [
  {
    id: 1,
    topic: 'Why RAG?',
    points: 1,
    context: [
      { type: 'text', text: 'Your company has an internal IT knowledge base containing current troubleshooting guides that were never part of the LLM’s training.' },
      { type: 'text', text: 'An employee asks:' },
      { type: 'quote', text: '“What is the latest approved procedure for replacing a lost laptop?”' },
    ],
    question: 'Why is RAG useful here?',
    options: opts(
      'It permanently teaches the LLM every IT document',
      'It retrieves current internal information and provides it to the LLM at runtime',
      'It removes the need for an LLM',
      'It guarantees that the generated answer is always correct',
    ),
    correctAnswer: 'B',
    explanation:
      'RAG retrieves relevant external knowledge when the request is made and supplies that context to the LLM. It does not permanently modify the model’s weights.',
  },
  {
    id: 2,
    topic: 'Indexing vs query pipeline',
    points: 1,
    context: [
      { type: 'text', text: 'Before employees start asking questions, the company wants to prepare its IT documentation for RAG.' },
    ],
    question: 'Which sequence belongs to the indexing pipeline?',
    options: opts(
      'User question → Retrieve → Prompt → Generate',
      'Documents → Clean/split → Embed → Store in index',
      'Question → LLM → Chunk → Answer',
      'Documents → LLM → Fine-tune → Vector search',
    ),
    correctAnswer: 'B',
    explanation:
      'The indexing pipeline prepares knowledge in advance by processing documents, splitting them into chunks, creating embeddings, and storing those chunks in the index.',
  },
  {
    id: 3,
    topic: 'Parsing',
    points: 1,
    context: [
      { type: 'text', text: 'An important troubleshooting procedure exists only inside a scanned PDF.' },
      { type: 'text', text: 'The normal text extractor returns almost no usable text.' },
    ],
    question: 'What is the best next step?',
    options: opts(
      'Increase top-k',
      'Use OCR to extract the scanned text',
      'Increase the LLM temperature',
      'Create smaller chunks from the empty output',
    ),
    correctAnswer: 'B',
    explanation:
      'OCR is suitable for scanned documents and images where there is no reliable digital text layer. Importantly, parsing happens before chunking, so information lost here will not magically reappear during retrieval.',
  },
  {
    id: 4,
    topic: 'Chunking',
    points: 1,
    context: [
      { type: 'text', text: 'An IT security guide contains:' },
      { type: 'quote', text: '“After five failed sign-in attempts, the account is temporarily locked. Users must contact the IT Service Desk to restore access.”' },
    ],
    question: 'Which chunking approach is best?',
    options: opts(
      'Keep both sentences together as one coherent chunk',
      'Put each sentence in unrelated chunks',
      'Put the entire 150-page IT handbook into one chunk',
      'Keep only the first sentence',
    ),
    correctAnswer: 'A',
    explanation:
      'The rule and its associated action belong together. Splitting connected information can cause retrieval to return an incomplete answer. Good chunking balances chunks that are too large against chunks that are too small.',
  },
  {
    id: 5,
    topic: 'Embeddings',
    points: 1,
    context: [
      { type: 'text', text: 'An employee asks:' },
      { type: 'quote', text: '“My authentication code isn’t working.”' },
      { type: 'text', text: 'The knowledge base contains an article titled:' },
      { type: 'quote', text: '“Troubleshooting multi-factor authentication failures”' },
    ],
    question: 'Why could semantic retrieval find this article even though the wording differs?',
    options: opts(
      'Both sentences contain exactly the same keywords',
      'Embeddings can represent similar meaning with nearby vectors',
      'The vector database rewrites the article',
      'The LLM must have memorized the article',
    ),
    correctAnswer: 'B',
    explanation:
      'Embeddings capture semantic relationships. Different phrases can therefore be close in vector space when they express similar intent.',
  },
  {
    id: 6,
    topic: 'Vector search and top-k',
    points: 1,
    context: [
      { type: 'text', text: 'The correct troubleshooting article ranks #6 in the vector search.' },
      { type: 'text', text: 'The retriever has: `top-k = 5`' },
    ],
    question: 'What happens?',
    options: opts(
      'Result #6 is automatically passed to the LLM',
      'Result #6 may not reach the prompt at all',
      'The LLM automatically changes top-k to 6',
      'The embedding model generates the final answer',
    ),
    correctAnswer: 'B',
    explanation:
      'Top-k controls how many candidate chunks are returned. If k = 5, the sixth-ranked result will normally be excluded unless filtering, query optimisation, or reranking moves it into the top five.',
  },
  {
    id: 7,
    topic: 'Retrieval quality',
    points: 1,
    context: [
      { type: 'text', text: 'An employee asks:' },
      { type: 'quote', text: '“How do I connect to the VPN from home?”' },
      { type: 'text', text: 'The system retrieves:' },
      { type: 'list', items: ['Result 1: VPN Setup Guide 2023', 'Result 2: VPN Setup Guide 2026', 'Result 3: Home Working Guide 2026'] },
      { type: 'text', text: 'The assistant answers using the outdated 2023 procedure.' },
    ],
    question: 'Which improvement would BEST address this problem?',
    options: opts(
      'Increase the LLM temperature',
      'Use metadata such as document status/effective date and reranking',
      'Make the response longer',
      'Fine-tune the LLM on writing style',
    ),
    correctAnswer: 'B',
    explanation:
      'Retrieval quality depends on more than semantic similarity. Metadata filters, freshness, reranking, recall, and precision are all retrieval-quality considerations that help the current 2026 guide outrank the outdated one.',
  },
  {
    id: 8,
    topic: 'Query optimisation',
    points: 1,
    context: [
      { type: 'text', text: 'An employee asks:' },
      { type: 'quote', text: '“Compare the VPN access requirements for employees using managed laptops and personal devices.”' },
    ],
    question: 'Which query optimisation technique is the best starting point?',
    options: opts('Query decomposition', 'Increase chunk overlap', 'OCR', 'Increase temperature'),
    correctAnswer: 'A',
    explanation:
      'The question combines two separate information needs: requirements for managed laptops and requirements for personal devices. Query decomposition splits it into sub-questions so the retriever can find evidence for each before the answers are compared.',
  },
  {
    id: 9,
    topic: 'Diagnose the RAG failure',
    points: 1,
    context: [
      { type: 'text', text: 'An employee asks how to fix a VPN error. The system:' },
      { type: 'list', items: ['Parsed the document correctly', 'Created suitable chunks', 'Retrieved the correct current troubleshooting chunk', 'Passed that chunk into the prompt'] },
      { type: 'text', text: 'The chunk says:' },
      { type: 'quote', text: '“Do not reinstall SecureConnect without IT approval.”' },
      { type: 'text', text: 'But the LLM answers:' },
      { type: 'quote', text: '“Uninstall and reinstall SecureConnect.”' },
    ],
    question: 'Where is the most likely failure?',
    options: opts('Parsing', 'Chunking', 'Retrieval', 'Prompting/generation'),
    correctAnswer: 'D',
    explanation:
      'In this case, the right information successfully reached the model, but the generated response contradicted that evidence. The prompt/generation stage therefore needs investigation. RAG failures can come from a bad source, parsing, chunking, retrieval, prompting, or security.',
  },
  {
    id: 10,
    topic: 'LangChain: put everything together',
    points: 1,
    context: [{ type: 'text', text: 'You already have documents stored in a vector store.' }],
    question: 'Which LangChain component is primarily responsible for returning the relevant chunks for a user’s question?',
    options: opts('`StrOutputParser`', '`as_retriever()`', '`ChatPromptTemplate`', '`PyPDFLoader`'),
    correctAnswer: 'B',
    explanation:
      'In the example query chain, `vector_store.as_retriever(search_kwargs={"k": 4})` creates the retriever that returns the top-k relevant chunks. `ChatPromptTemplate` then augments the request with context, and the LLM generates the response.',
  },
];
