'use client';

import { useState, useEffect, useRef } from 'react';

interface AddressResult {
  roadAddress: string;
  jibunAddress: string;
  displayAddress: string;
  placeName?: string;
  category?: string;
  lat: number;
  lng: number;
  type: 'address' | 'place';
}

interface AddressSearchInputProps {
  value: string;
  onChange: (address: string) => void;
  placeholder?: string;
  label?: string;
  helperText?: string;
}

export default function AddressSearchInput({
  value,
  onChange,
  placeholder = '주소를 검색하세요',
  label,
  helperText,
}: AddressSearchInputProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<AddressResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [shouldSearch, setShouldSearch] = useState(false); // 검색 실행 여부
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 감지하여 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // value prop이 변경되면 query 업데이트 (외부에서 변경된 경우)
  useEffect(() => {
    // query와 value가 다를 때만 업데이트 (무한 루프 방지)
    if (query !== value) {
      setQuery(value);
      setShouldSearch(false); // 외부에서 값이 변경되면 검색 안 함
      setShowResults(false);
      setResults([]);
    }
  }, [value]);

  // 디바운스 검색 (shouldSearch가 true일 때만)
  useEffect(() => {
    // 검색하지 않아도 되면 종료
    if (!shouldSearch) {
      return;
    }

    if (!query || query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    // 이전 타이머 취소
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // 500ms 후에 검색
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        const response = await fetch(
          `/api/search/address?query=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
          throw new Error('Failed to search address');
        }

        const data = await response.json();
        setResults(data.results || []);
        setShowResults(true);
      } catch (error) {
        console.error('Address search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, shouldSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    setShouldSearch(true); // 사용자가 직접 타이핑하면 검색 활성화
  };

  const handleSelectAddress = (result: AddressResult) => {
    setQuery(result.displayAddress);
    onChange(result.displayAddress);
    setShowResults(false);
    setResults([]);
    setShouldSearch(false); // 선택 후에는 다시 검색 안 함
  };

  return (
    <div ref={wrapperRef} className="relative">
      {label && (
        <label className="block font-semibold text-gray-900 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            // 검색 활성화 상태에서만 포커스 시 결과 표시
            if (shouldSearch && results.length > 0) {
              setShowResults(true);
            }
          }}
          placeholder={placeholder}
          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />

        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {!isSearching && query && (
          <button
            onClick={() => {
              setQuery('');
              onChange('');
              setResults([]);
              setShowResults(false);
              setShouldSearch(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {helperText && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}

      {/* 검색 결과 드롭다운 */}
      {showResults && results.length > 0 && (
        <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={index}
              onClick={() => handleSelectAddress(result)}
              className="w-full px-4 py-3 text-left hover:bg-indigo-50 transition border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start">
                <svg className="w-5 h-5 text-indigo-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="flex-1 min-w-0">
                  {result.placeName ? (
                    <>
                      <p className="font-semibold text-gray-900 truncate">
                        {result.placeName}
                      </p>
                      <p className="text-sm text-gray-700 truncate">
                        {result.roadAddress || result.displayAddress}
                      </p>
                      {result.category && (
                        <p className="text-xs text-gray-500 truncate">
                          {result.category}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-gray-900 truncate">
                        {result.roadAddress || result.displayAddress}
                      </p>
                      {result.jibunAddress && result.jibunAddress !== result.roadAddress && (
                        <p className="text-sm text-gray-600 truncate">
                          {result.jibunAddress}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 검색 결과 없음 */}
      {showResults && !isSearching && query.length >= 2 && results.length === 0 && (
        <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
          <p className="text-sm text-gray-500 text-center">검색 결과가 없습니다</p>
        </div>
      )}
    </div>
  );
}
