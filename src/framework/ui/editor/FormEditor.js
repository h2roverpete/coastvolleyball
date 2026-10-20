import {createContext, useCallback, useContext, useEffect, useMemo, useState} from "react";
import './Editor.css';

const FormEditContext = createContext(null);


/**
 * Object containing a data change
 *
 * @typedef DataChange
 * @property name {String}
 * @property value {String}
 */

/**
 * Callback function to receive data changes.
 *
 * @callback DataCallback
 * @param {{name: String, value:String|Number|Boolean|File}|{changes:[]}} params
 */

/**
 * API (Context) for managing form data.
 *
 * @template T
 * @typedef FormDataAPI
 *
 * @property {function(T)} setData
 * @property {function(string)} isTouched
 * @property {function()} isDataChanged
 * @property {function()} revert
 * @property {function()} reset
 * @property {function(T)} update
 * @property {DataCallback} onDataChanged
 * @property {T} edits
 */

/**
 *
 * @param {function(FormDataAPI)} [apiRef]
 * @param children
 * @returns {JSX.Element}
 * @constructor
 */
export default function FormEditor({apiRef, children}) {

  const [originalData, setOriginalData] = useState(null);
  const [edits, setEdits] = useState({});
  const [touched, setTouched] = useState([]);

  /**
   * Receive changes to form data.
   * @type DataCallback
   */
  const onDataChanged = useCallback(({name, value, changes}) => {
    const editsCopy = {...edits};
    const touchedCopy = [...touched];
    if (changes && Array.isArray(changes)) {
      for (const change of changes) {
        console.debug(`Form data changed: {name: '${change.name}' value: '${change.value}}'.`);
        editsCopy[change.name] = change.value;
        touchedCopy.push(change.name);
      }
    } else if (name && edits[name] !== value) {
      console.debug(`Form data changed: {name: '${name}' value: '${value}}'.`);
      if ((value === undefined || value === null) && edits[name]) {
        delete editsCopy[name];
      } else {
        editsCopy[name] = value;
      }
      touchedCopy.push(name);
    }
    setEdits(editsCopy);
    setTouched(touchedCopy);
  }, [edits, touched]);

  /**
   * Update the original form data and clear edits, i.e. after a DynamoDB update.
   * @template T
   * @type {function(T): void}
   */
  const update = useCallback((data) => {
    setEdits({...data});
    setOriginalData({...data});
    setTouched([]);
  }, [setEdits, setOriginalData, setTouched]);

  /**
   * Set initial form data. Can only be called once per use of <FormEditor>
   * @template T
   * @type {function(T): void}
   */
  const setData = useCallback((data) => {
    if (data && !originalData) {
      // protect from null data & multiple initialization
      update(data);
    }
  },[originalData, update]);



  /**
   * Check if a given key/field has been edited.
   * @type {function(String): boolean}
   */
  const isTouched = useCallback((name) => {
    if (name) {
      return touched.includes(name);
    }
  }, [touched]);

  /**
   * Have any values changed from their initial ones?
   * @type {function(): boolean}
   */
  const isDataChanged = useCallback(() => {
    return JSON.stringify(edits) !== JSON.stringify(originalData);
  }, [edits, originalData]);

  /**
   * Revert changes.
   * @type {(function(): void)}
   */
  const revert = useCallback(() => {
    setEdits({...originalData});
    setTouched([]);
  }, [setEdits, setTouched, originalData]);

  const reset = useCallback(() => {
    setOriginalData(null);
    setEdits({});
    setTouched([]);
  }, [setOriginalData, setEdits, setTouched]);

  /** @type FormDataAPI */
  const context = useMemo(() => {
    return {
      setData: setData,
      isTouched: isTouched,
      isDataChanged: isDataChanged,
      revert: revert,
      reset: reset,
      update: update,
      onDataChanged: onDataChanged,
      edits: edits,
    }
  }, [setData, isTouched, isDataChanged, revert, reset, update, onDataChanged, edits]);

  useEffect(() => {
    if (apiRef) {
      apiRef(context);
    }
  }, [edits, touched, apiRef, context]);

  return (
    <FormEditContext.Provider value={context}>
      {children}
    </FormEditContext.Provider>
  )
}

/**
 * @template T
 * @returns {FormDataAPI<T>|null}
 */
export function useFormData() {
  return useContext(FormEditContext);
}