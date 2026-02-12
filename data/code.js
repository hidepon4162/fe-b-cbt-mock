/**
 * 擬似言語コード（科目B）
 */

export const code1 = `A ← [ 7, 3, 9, 4, 6 ]
N ← LENGTH(A)

for last ← N downto 2
  MAX ← A[1]
  MAX_POS ← 1

  for i ← 2 to last
    if A[i] > MAX then
      MAX ← A[i]
      MAX_POS ← i
    endif
  endfor

  TEMP ← A[last]
  A[last] ← A[MAX_POS]
  A[MAX_POS] ← TEMP
endfor`;

export const code2 = `A ← [ 4, 6, 2, 5, 1 ]
N ← LENGTH(A)

i ← 1
while i < N
  if A[i] > A[i+1] then
    TEMP ← A[i]
    A[i] ← A[i+1]
    A[i+1] ← TEMP
  endif
  i ← i + 1
endwhile`;

// 線形探索
export const code3 = `A ← [ 3, 7, 1, 9, 4 ]
N ← LENGTH(A)
target ← 9
pos ← 0

i ← 1
while i ≤ N
  if A[i] = target then
    pos ← i
    exit
  endif
  i ← i + 1
endwhile`;

// 二分探索（昇順ソート済み配列）
export const code4 = `A ← [ 1, 3, 5, 7, 9, 11 ]
N ← LENGTH(A)
target ← 7
pos ← 0

low ← 1
high ← N
while low ≤ high
  mid ← (low + high) ÷ 2
  if A[mid] = target then
    pos ← mid
    exit
  elseif A[mid] < target then
    low ← mid + 1
  else
    high ← mid − 1
  endif
endwhile`;

// 再帰（階乗）
export const code5 = `function FACT(n)
  if n ≤ 1 then
    return 1
  endif
  return n × FACT(n − 1)
endfunction`;

// スタック（配列による実装）
export const code6 = `S ← [ 0, 0, 0, 0, 0 ]
top ← 0

function PUSH(x)
  top ← top + 1
  S[top] ← x
endfunction

function POP()
  if top > 0 then
    x ← S[top]
    top ← top − 1
    return x
  endif
  return −1
endfunction`;

// 挿入ソート
export const code7 = `A ← [ 5, 2, 8, 1, 6 ]
N ← LENGTH(A)

for i ← 2 to N
  x ← A[i]
  j ← i − 1
  while j ≥ 1 and A[j] > x
    A[j + 1] ← A[j]
    j ← j − 1
  endwhile
  A[j + 1] ← x
endfor`;

// キュー（配列による実装）
export const code8 = `Q ← [ 0, 0, 0, 0, 0 ]
MAX ← 5
head ← 1
tail ← 1

function ENQUEUE(x)
  if (tail mod MAX) + 1 ≠ head then
    Q[tail] ← x
    tail ← (tail mod MAX) + 1
  endif
endfunction

function DEQUEUE()
  if head ≠ tail then
    x ← Q[head]
    head ← (head mod MAX) + 1
    return x
  endif
  return −1
endfunction`;

// 文字列検索（単純照合）
export const code9 = `T ← "ABCDEFABCDEF"
P ← "CDE"
M ← LENGTH(T)
N ← LENGTH(P)
pos ← 0

i ← 1
while i ≤ M − N + 1
  j ← 1
  while j ≤ N and SUBSTR(T, i + j − 1, 1) = SUBSTR(P, j, 1)
    j ← j + 1
  endwhile
  if j > N then
    pos ← i
    exit
  endif
  i ← i + 1
endwhile`;

// フィボナッチ（再帰）
export const code10 = `function FIB(n)
  if n ≤ 1 then
    return n
  endif
  return FIB(n − 1) + FIB(n − 2)
endfunction`;

// 連結リスト（ノード挿入）
export const code11 = `// ノード: data, next
// head: 先頭へのポインタ

function INSERT_AFTER(p, x)
  new_node ← ALLOC(NODE)
  new_node.data ← x
  new_node.next ← p.next
  p.next ← new_node
endfunction`;

// 二分探索木（探索）
export const code12 = `// ノード: key, left, right
// root: 根へのポインタ

function SEARCH(node, key)
  if node = null then
    return null
  endif
  if node.key = key then
    return node
  elseif key < node.key then
    return SEARCH(node.left, key)
  else
    return SEARCH(node.right, key)
  endif
endfunction`;
