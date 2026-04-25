"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type GlobalSearchContextType = {
  query: string;
  setQuery: (value: string) => void;
  nextMatch: () => void;
  prevMatch: () => void;
  clearSearch: () => void;
  totalMatches: number;
  activeIndex: number;
  setSearchRoot: (node: HTMLElement | null) => void;
};

const GlobalSearchContext = createContext<GlobalSearchContextType | null>(null);

type WrappedNodeRecord = {
  parent: Node;
  fragment: DocumentFragment;
  originalNode: Text;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function unwrapMarks(root: HTMLElement | null) {
  if (!root) return;

  const marks = root.querySelectorAll("mark[data-global-search='true']");
  marks.forEach((mark) => {
    const parent = mark.parentNode;
    if (!parent) return;

    const textNode = document.createTextNode(mark.textContent || "");
    parent.replaceChild(textNode, mark);
    parent.normalize();
  });
}

function shouldIgnoreElement(el: HTMLElement | null) {
  if (!el) return true;

  if (
    el.closest("[data-search-ignore='true']") ||
    el.closest("script") ||
    el.closest("style") ||
    el.closest("noscript") ||
    el.closest("input") ||
    el.closest("textarea") ||
    el.closest("select") ||
    el.closest("button")
  ) {
    return true;
  }

  return false;
}

function collectTextNodes(root: HTMLElement) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const text = node.textContent?.trim();
      if (!text) return NodeFilter.FILTER_REJECT;

      const parent = node.parentElement;
      if (!parent || shouldIgnoreElement(parent)) {
        return NodeFilter.FILTER_REJECT;
      }

      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes: Text[] = [];
  let current = walker.nextNode();

  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }

  return nodes;
}

function highlightMatches(root: HTMLElement, query: string) {
  unwrapMarks(root);

  if (!query.trim()) return [];

  const safeQuery = escapeRegExp(query.trim());
  const regex = new RegExp(safeQuery, "gi");
  const textNodes = collectTextNodes(root);
  const marks: HTMLElement[] = [];

  textNodes.forEach((textNode) => {
    const text = textNode.textContent || "";
    if (!regex.test(text)) return;

    regex.lastIndex = 0;

    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;

      if (start > lastIndex) {
        fragment.appendChild(
          document.createTextNode(text.slice(lastIndex, start))
        );
      }

      const mark = document.createElement("mark");
      mark.setAttribute("data-global-search", "true");
      mark.className =
        "rounded-[4px] bg-[#FDE68A] px-[1px] text-inherit transition-all";
      mark.textContent = text.slice(start, end);

      fragment.appendChild(mark);
      marks.push(mark);

      lastIndex = end;
    }

    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    const parent = textNode.parentNode;
    if (parent) {
      parent.replaceChild(fragment, textNode);
    }
  });

  return marks;
}

export function GlobalSearchProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [totalMatches, setTotalMatches] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const searchRootRef = useRef<HTMLElement | null>(null);
  const marksRef = useRef<HTMLElement[]>([]);

  const setSearchRoot = useCallback((node: HTMLElement | null) => {
    searchRootRef.current = node;
  }, []);

  const applyActiveState = useCallback((index: number) => {
    marksRef.current.forEach((mark, i) => {
      if (i === index) {
        mark.classList.add("bg-[#2563EB]", "text-white", "shadow-sm");
        mark.classList.remove("bg-[#FDE68A]");
      } else {
        mark.classList.remove("bg-[#2563EB]", "text-white", "shadow-sm");
        mark.classList.add("bg-[#FDE68A]");
      }
    });

    const active = marksRef.current[index];
    if (active) {
      active.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
  }, []);

  useEffect(() => {
    const root = searchRootRef.current;
    if (!root) return;

    const marks = highlightMatches(root, query);
    marksRef.current = marks;
    setTotalMatches(marks.length);
    setActiveIndex(marks.length > 0 ? 0 : -1);

    if (marks.length > 0) {
      requestAnimationFrame(() => {
        applyActiveState(0);
      });
    }
  }, [query, applyActiveState]);

  const nextMatch = useCallback(() => {
    if (!marksRef.current.length) return;

    const next =
      activeIndex < 0
        ? 0
        : (activeIndex + 1) % Math.max(marksRef.current.length, 1);

    setActiveIndex(next);
    applyActiveState(next);
  }, [activeIndex, applyActiveState]);

  const prevMatch = useCallback(() => {
    if (!marksRef.current.length) return;

    const total = marksRef.current.length;
    const prev = activeIndex <= 0 ? total - 1 : activeIndex - 1;

    setActiveIndex(prev);
    applyActiveState(prev);
  }, [activeIndex, applyActiveState]);

  const clearSearch = useCallback(() => {
    setQuery("");
    setTotalMatches(0);
    setActiveIndex(-1);

    if (searchRootRef.current) {
      unwrapMarks(searchRootRef.current);
    }

    marksRef.current = [];
  }, []);

  const value = useMemo(
    () => ({
      query,
      setQuery,
      nextMatch,
      prevMatch,
      clearSearch,
      totalMatches,
      activeIndex,
      setSearchRoot,
    }),
    [
      query,
      nextMatch,
      prevMatch,
      clearSearch,
      totalMatches,
      activeIndex,
      setSearchRoot,
    ]
  );

  return (
    <GlobalSearchContext.Provider value={value}>
      {children}
    </GlobalSearchContext.Provider>
  );
}

export function useGlobalSearch() {
  const context = useContext(GlobalSearchContext);

  if (!context) {
    throw new Error(
      "useGlobalSearch must be used inside GlobalSearchProvider"
    );
  }

  return context;
}