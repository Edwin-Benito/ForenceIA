export declare const analyzeIdentityDocument: (imageBuffer: Buffer) => Promise<{
    personalInfo: {
        fullName: string;
        idNumber: string;
        curp: any;
    };
    forensicAnalysis: {
        faceDetected: boolean;
        isSpecimen: boolean;
        isDigitallyAltered: any;
        verdict: {
            status: string;
            message: any;
            color: string;
        };
    };
}>;
//# sourceMappingURL=document.service.d.ts.map