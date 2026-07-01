const disabled = () => {
  throw new Error("Supabase backend silinib: bu layihə artıq statik frontend versiyasıdır.");
};
export const supabase = new Proxy({}, { get: disabled }) as never;
