import { http } from "@/api/utils";

export interface TreeLeaf {
  leafIndex: number;
  commitment: bigint;
}

interface TreeLeafRaw {
  leaf_index: number;
  commitment: string;
}

export const getTreeLeaves = async (): Promise<TreeLeaf[]> => {
  const { data } = await http.get<{ success: boolean; data: TreeLeafRaw[] }>("/notes/leaves");
  return (data.data || []).map((item) => ({
    leafIndex: item.leaf_index,
    commitment: BigInt(item.commitment),
  }));
};
