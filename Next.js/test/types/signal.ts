export interface SignalData {
    dataId: string
    itstId: string
    eqmnId: string
    trsmUtcTime: number
    trsmYear: string
    trsmMt: string
    trsmDy: string
    trsmTm: string
    trsmMs: string
    
    ntStsgStatNm: string
    ntLtsgStatNm: string
    ntPdsgStatNm: string
    ntBssgStatNm: string
    ntBcsgStatNm: string
    ntUtsgStatNm: string

    stStsgStatNm: string
    stLtsgStatNm: string
    stPdsgStatNm: string
    stBssgStatNm: string
    stBcsgStatNm: string
    stUtsgStatNm: string

      // 동쪽 (et = East)
  etStsgStatNm: string
  etLtsgStatNm: string
  etPdsgStatNm: string
  etBssgStatNm: string
  etBcsgStatNm: string
  etUtsgStatNm: string

  // 서쪽 (wt = West)
  wtStsgStatNm: string
  wtLtsgStatNm: string
  wtPdsgStatNm: string
  wtBssgStatNm: string
  wtBcsgStatNm: string
  wtUtsgStatNm: string

  // 북동 (ne = NorthEast)
  neStsgStatNm: string
  neLtsgStatNm: string
  nePdsgStatNm: string
  neBssgStatNm: string
  neBcsgStatNm: string
  neUtsgStatNm: string

  // 북서 (nw = NorthWest)
  nwStsgStatNm: string
  nwLtsgStatNm: string
  nwPdsgStatNm: string
  nwBssgStatNm: string
  nwBcsgStatNm: string
  nwUtsgStatNm: string

  // 남동 (se = SouthEast)
  seStsgStatNm: string
  seLtsgStatNm: string
  sePdsgStatNm: string
  seBssgStatNm: string
  seBcsgStatNm: string
  seUtsgStatNm: string

  // 남서 (sw = SouthWest)
  swStsgStatNm: string
  swLtsgStatNm: string
  swPdsgStatNm: string
  swBssgStatNm: string
  swBcsgStatNm: string
  swUtsgStatNm: string
}

export interface SignalResponse {
  totalCount: number
  pageNo: number
  numOfRows: number
  data: SignalData[]
}