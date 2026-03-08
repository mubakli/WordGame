export interface WordPair {
  id: string;
  english: string;
  turkish: string;
}

export const initialVocabulary: WordPair[] = [
  { id: '1', english: 'Substantial', turkish: 'Önemli, büyük, kayda değer' },
  { id: '2', english: 'Inevitable', turkish: 'Kaçınılmaz' },
  { id: '3', english: 'Crucial', turkish: 'Çok önemli, kritik' },
  { id: '4', english: 'Ambiguous', turkish: 'Belirsiz, iki anlamlı' },
  { id: '5', english: 'Persistent', turkish: 'Israrcı, kalıcı' },
  { id: '6', english: 'Vulnerable', turkish: 'Savunmasız, incinebilir' },
  { id: '7', english: 'Abundant', turkish: 'Bol, berekeli' },
  { id: '8', english: 'Obsolete', turkish: 'Eski, modası geçmiş, kullanılmayan' },
  { id: '9', english: 'Profound', turkish: 'Derin, şiddetli, köklü' },
  { id: '10', english: 'Versatile', turkish: 'Çok yönlü, on parmağında on marifet olan' },
];
