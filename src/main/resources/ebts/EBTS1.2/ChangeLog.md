# Changelog
All notable changes to the dod-ebts-1.2.txt file will be documented in this file.

## [Unreleased]

## [1.0.0] - 2019-06-24
### Added


### Changed

_________________________________________________________________________________________________
Line: 1272
Field(s): 2.073
From:
    [M,		AMN,	CAR,	CNA,	DEK,	DEU,	FANC,	FAUF,	
    MPR,	NFUF,	SRE,	MAP M, TPIS O,	TPFS O,	SRT O,	ERRT O,	LFS O,	CFS O,
    MCS O,	ELR O,	LSR O,	NAR O,	ERRL O,	LFIS O,	LFFS O,	LPNQ O,	SRL O,
    LPNR O,	ULM O,	ULD O,	ULAC O,	ULAR O,	ULDR O,	UULD O,	LRSQ O,	LSMQ O,
    LSMR O,	LRSR O,	ERRA O,	IRQ O,	IRR O,	ERRI O,	ISR O,	FIS O,	FISR,
    ERRI O,	CPR,	CPD,	PRR,	PDR,	DPRS,	TPRS O]

To:
    [M,		AMN,	CAR,	CNA,	DEK,	DEU,	FANC,	FAUF,	
    MPR,	NFUF,	SRE,	MAP O, TPIS O,	TPFS O,	SRT O,	ERRT O,	LFS O,	CFS O,
    MCS O,	ELR O,	LSR O,	NAR O,	ERRL O,	LFIS O,	LFFS O,	LPNQ O,	SRL O,
    LPNR O,	ULM O,	ULD O,	ULAC O,	ULAR O,	ULDR O,	UULD O,	LRSQ O,	LSMQ O,
    LSMR O,	LRSR O,	ERRA O,	IRQ O,	IRR O,	ERRI O,	ISR O,	FIS O,	FISR,
    ERRI O,	CPR,	CPD,	PRR,	PDR,	DPRS,	TPRS O]
_________________________________________________________________________________________________

_________________________________________________________________________________________________
Line: 2085
Field(s): 4.001 - 4.009
From:
    [O,	CAR,	DEK,	DEU,	MAP,	FANC,	CNA,	MPR,	AMN,	NFUF,	DPRS,	TPFS,
     SRT,	MCS,	LSR,	ERRL,	LFFS,	LFIS,	LPNQ,	SRL,	LPNR,	ULM,	TPRS M,	TPIS M,
     LFS M,	CFS M,	ELR M,	IRR M,	FIS M,	VER M
     ]
     4.01...0	T4_LEN	B4	2-8	1
     	desc="Logical Record Length"
     	long_desc="This mandatory field shall contain the length of the logical record \
     		specifying the total number of bytes, including every byte of all nine fields \
     		contained in the record.";
     4.02...4	T4_IDC	B1	1-2	1
     	desc="Image Designation Character"
     	long_desc="This mandatory  field shall be used to identify the image data contained \
     		in this record. The IDC in this field shall be a binary representation of the \
     		IDC found in the file content field of the Type 1 record.";
     4.03...5	T4_IMP	B1	1	1
     	desc="Impression Type"
     	mmap="0:Live-scan Plain|1:Live-Scan Rolled|2:Nonlive-scan Plain|3:Nonlive-scan Rolled|4:Latent Impression|5:Latent Tracing|6:Latent Photo|7:Latent Lift"
     	default="0"
     	long_desc="This mandatory field shall contain a code selected from an ANSI table,\
     		describing the manner by which the fingerprint image information was \
     		obtained.";

     4.04...6	T4_FGP	B1	1-3	1-6
     	desc="Finger Position"
     	mmap="0:Unknown|1:Right Thumb|2:Right Index|3:Right Middle|4:Right Ring|5:Right Little|6:Left Thumb|7:Left Index|8:Left Middle|9:Left Ring|10:Left Little|11:Plain Right Thumb|12:Plain Left Thumb|13:Plain Right Four Fingers|14:Plain Left Four Fingers|15:Left and Right Thumbs|255:None"
     	empty="255"
     	default="0"
     	long_desc="This mandatory field shall contain possible finger positions. The first \
     		element is used for the known or most probable finger. Up to five additional \
     		finger positions may be referenced by entering the alternate finger \
     		positions. The code should be taken from the ANSI table.";

     4.05...12	T4_ISR	B1	1	1
     	desc="Image Scanning Resolution"
     	mmap="0:Minimum Scanning Resolution|1:Native Scanning Resolution"
     	default="0"
     	long_desc="This field shall contain a 0 if the minimum scanning resolution is used \
     		and a 1 if the native scanning resolution is used.";

     4.06...13	T4_HLL	B2	1-5	1
     	desc= "Horizontal Line Length"
     	default="0"
     	long_desc="This field shall be used to specify the number of pixels contained on a \
     		single horizontal line of the transmitted image.";

     4.07...15	T4_VLL	B2	1-5	1
     	desc= "Vertical Line Length"
     	default="0"
     	long_desc="This field should be used to specify the number of vertical lines \
     		contained in the transmitted image.";

     4.08...17	T4_GCA	B1	1-3	1
     	desc= "Grayscale Compression Algorithm"
     	long_desc="This field should be used to specify the type of gray-scale compression \
     		algorithm used. A 0 denotes no compression. Otherwise a number will be \
     		allocated to the particular compression technique used by the interchange \
     		parties. A 1 denotes CJIS WSQ compression.";

     4.09...18	T4_DAT	B1	1-x	1
     	desc= "Image Data"
     	long_desc="This field contains the image data.";

To:
    [M,	CAR,	DEK,	DEU,	MAP,	FANC,	CNA,	MPR,	AMN,	NFUF,	DPRS,	TPFS,
    SRT,	MCS,	LSR,	ERRL,	LFFS,	LFIS,	LPNQ,	SRL,	LPNR,	ULM,	TPRS M,	TPIS M,
    LFS M,	CFS M,	ELR M,	IRR M,	FIS M,	VER M
    ]
    4.001...0	T4_LEN	B4	2-8	1
            desc="Logical Record Length"
            long_desc="This mandatory field shall contain the length of the logical record \
                    specifying the total number of bytes, including every byte of all nine fields \
                    contained in the record.";
    4.002...4	T4_IDC	B1	1-2	1
            desc="Image Designation Character"
            long_desc="This mandatory  field shall be used to identify the image data contained \
                    in this record. The IDC in this field shall be a binary representation of the \
                    IDC found in the file content field of the Type 1 record.";
    4.003...5	T4_IMP	B1	1	1
            desc="Impression Type"
            mmap="0:Live-scan Plain|1:Live-Scan Rolled|2:Nonlive-scan Plain|3:Nonlive-scan Rolled|4:Latent Impression|5:Latent Tracing|6:Latent Photo|7:Latent Lift"
            default="0"
            long_desc="This mandatory field shall contain a code selected from an ANSI table,\
                    describing the manner by which the fingerprint image information was \
                    obtained.";

    4.004...6	T4_FGP	B1	1-3	1-6
            desc="Finger Position"
            mmap="0:Unknown|1:Right Thumb|2:Right Index|3:Right Middle|4:Right Ring|5:Right Little|6:Left Thumb|7:Left Index|8:Left Middle|9:Left Ring|10:Left Little|11:Plain Right Thumb|12:Plain Left Thumb|13:Plain Right Four Fingers|14:Plain Left Four Fingers|15:Left and Right Thumbs|255:None"
            empty="255"
            default="0"
            long_desc="This mandatory field shall contain possible finger positions. The first \
                    element is used for the known or most probable finger. Up to five additional \
                    finger positions may be referenced by entering the alternate finger \
                    positions. The code should be taken from the ANSI table.";

    4.005...12	T4_ISR	B1	1	1
            desc="Image Scanning Resolution"
            mmap="0:Minimum Scanning Resolution|1:Native Scanning Resolution"
            default="0"
            long_desc="This field shall contain a 0 if the minimum scanning resolution is used \
                    and a 1 if the native scanning resolution is used.";

    4.006...13	T4_HLL	B2	1-5	1
            desc= "Horizontal Line Length"
            default="0"
            long_desc="This field shall be used to specify the number of pixels contained on a \
                    single horizontal line of the transmitted image.";

    4.007...15	T4_VLL	B2	1-5	1
            desc= "Vertical Line Length"
            default="0"
            long_desc="This field should be used to specify the number of vertical lines \
                    contained in the transmitted image.";

    4.008...17	T4_GCA	B1	1-3	1
            desc= "Grayscale Compression Algorithm"
            default="0"
            long_desc="This field should be used to specify the type of gray-scale compression \
                    algorithm used. A 0 denotes no compression. Otherwise a number will be \
                    allocated to the particular compression technique used by the interchange \
                    parties. A 1 denotes CJIS WSQ compression.";

    4.009...18	T4_DAT	B1	1-x	1
            desc= "Image Data"
            long_desc="This field contains the image data.";
_________________________________________________________________________________________________

_________________________________________________________________________________________________
Line: 2589
Field(s): 10.008
From:
     10.008	T10_SLC	N	2-2	1
     	desc="Scale Units"
     	mmap="00:No Scale Given|1:Pixels per Inch|2:Pixels per Centimeter"
     	default="00"
            	long_desc="This mandatory field specifies the units used to \
     		density). A zero indicates no scale is given, a one \
     		indicates pixels per inch, a two indicates pixels \
     		per centimeter.";

To:
    10.008	T10_SLC	N	1-1	1#	desc="Scale Units"
	mmap="0:No Scale Given|1:Pixels per Inch|2:Pixels per Centimeter"
	default="0"
      	long_desc="This mandatory field specifies the units used to \
		describe the image sampling frequency (pixel \
		density). A zero indicates no scale is given, a one \
		indicates pixels per inch, a two indicates pixels \
		per centimeter.";
_________________________________________________________________________________________________

_________________________________________________________________________________________________
Line: 3892
Field(s): 17.013
From:
    [O, CAR, DEK, DEU, MAP, FANC, CNA, MPR, AMN, NFUF, DPRS
    ]		
    17.013	T17_IIQ		N	2-3	1
    	desc="Iris Image Quality"
    	long_desc="This optional field shall indicate the image quality value.  This \
    		field is defined in ANSI-INCITS 379-2004 ??? Iris Image Interchange Forma";

    17.014	T17_RAE 	AN	1-4	1

To:
    [M, CAR, DEK, DEU, MAP, FANC, CNA, MPR, AMN, NFUF, DPRS
    ]
    17.013	T17_CSP		A	3-4	0-1
            desc="Color Space"
            long_desc="This field is Mandatory if an image is present in 
            Field 17.999: Iris image data / DATA. Otherwise it is absent.";

    [O, CAR, DEK, DEU, MAP, FANC, CNA, MPR, AMN, NFUF, DPRS
    ]
    17.014	T17_RAE 	AN	1-4	1
_________________________________________________________________________________________________

### Removed


### Fixed

