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
